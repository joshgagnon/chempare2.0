
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


const STRINGS = {
    english: {
        product_id: 'Suppliers ID',
        product_name: 'Product Name',
        formula: 'Formula',
        cas: 'CAS',
        mol_weight: 'Molecular Weight',
        price: 'Price',
        amount: 'Amount',
        temperature: 'Storage Temperature',
        url: 'URL',
        last_check_ms: 'Last Checked',
        categories: 'Categories',
        search_placeholder: 'Search...',
        search_advanced: 'Advanced',
        price_per_unit: 'Price per mmol',
        na: 'N/A',
    }
};



Search = React.createClass({

    componentDidMount() {
        this._debouncedChange = _.debounce(this.props.handleChange, 100);
    },

    handleChange(e) {
        let value = ReactDOM.findDOMNode(this.refs.input).value;
        this._debouncedChange(value);
    },
    render() {
        return <form>
            <input ref="input" type="text" className="form-control input-lg" placeholder="Search..." onChange={this.handleChange} />
        </form>

    }
})


TableView = React.createClass({
    mixins: [ReactMeteorData],
    fields: ['product_name', 'cas', 'mol_weight', 'price', 'amount', 'price_per_unit', 'url'],
    getInitialState() {
        return {query: ''};
    },

    getMeteorData() {
        const handle = Meteor.subscribe("products", this.state.query);
        return {
          loading: ! handle.ready(), // Use handle to show loading state,
          products: Products.find({}).fetch(),
          query: this.state.query
        };

   },
    handleSearch(query) {
        const queryRgxp = {
            $regex: '.*' + query.replace(/[-\/\(\)\+ ]+/g, '.*') + '.*',
            $options: 'i'
        };
        const queryObj = {
                "$or": [{
                    cas: queryRgxp
                }, {
                    formula: queryRgxp
                }, {
                    product_name: queryRgxp
                }]
        };
        console.log(queryObj)
        this.setState({query: queryObj});
        Session.set('query', queryObj)
    },
    render() {
        console.log(this.data)
        return <div className="table-view">
            <Search handleChange={this.handleSearch}/>

            <table className="table">
                <thead>
                    <tr>
                        { this.fields.map(field => {
                            return <th key={field}>{STRINGS.english[field]}</th>
                        })}
                    </tr>
                </thead>
                <tbody>
                   { !this.data.loading ? this.data.products.map(product => {
                        return <tr key={product._id._str}>{this.fields.map(field => {
                            return <td key={field}>{product[field]}</td>
                        })}</tr>
                    }) : <tr><td><div className="loading"></div></td></tr> }
                </tbody>
                </table>
        </div>

    }
})


App = React.createClass({
    render() {
        return (
            <div>
               <nav className="navbar navbar-default">
                    <div className="container-fluid">
                        <a className="navbar-brand" href="#">Chem<span className="green">pare</span>.it</a>
                        <ul className="nav navbar-nav navbar-right">
                            <li>  <AccountsUIWrapper /></li>
                        </ul>
                    </div>

                </nav>
                <div className="container">
                    <TableView />
                </div>
            </div>
        );
  }
});