
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
});


function renderCell(value, product, type) {
    switch (type) {
        case 'url':
            return <a href= {value }>{value.match(/https?:\/\/([^/]*)/)[1] }</a>;
        case 'categories':
            return value.join(', ');
        case 'price':
            return (product.currency || '$') + '' + product.price;
        case 'last_check_ms':
            if (value) {
                var date = new Date();
                date.setTime(value);
                return date.toDateString();
            }
            return STRINGS.english.na;
        case 'amount':
            return (product.amount || '') + (product.units || '').toLowerCase();
        case 'price_per_unit':
            if (product.price_per_unit)
                return (product.currency || '$') + numberWithCommas('' + product.price_per_unit.toFixed(0));
    }
    return product[type] === undefined ? STRINGS.english.na : value || '';
}


DEFAULT_LIMIT = 100;
INCREMENT = 50;

TableView = React.createClass({
    mixins: [ReactMeteorData],
    fields: ['product_name', 'cas', 'mol_weight', 'price', 'amount', 'price_per_unit', 'url'],
    getInitialState() {
        return {query: '', sort: {product_name: 1}, visibleProducts: {}, limit: DEFAULT_LIMIT};
    },

    getMeteorData() {
        const handle = Meteor.subscribe("products", this.state.query, this.state.sort, this.state.limit);
        return {
          loading: ! handle.ready(), // Use handle to show loading state,
          products: Products.find({}).fetch(),
          query: this.state.query,
          sort: this.state.sort,
          limit: this.state.limit
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
        this.setState({query: queryObj, limit: DEFAULT_LIMIT});
    },

    handleSort(key) {
        const sort = {};
        sort[key] = this.state.sort[key] ? -this.state.sort[key] : 1;
        this.setState({sort: sort, limit: DEFAULT_LIMIT});
    },

    addListeners() {
        this._listener = function(){
            const target = $(ReactDOM.findDOMNode(this))
            const threshold = $(window).scrollTop() + $(window).height() - target.height();
            if(target.offset().top < threshold && !this.data.loading){
                this.setState({limit: this.state.limit + INCREMENT });
            }
        }.bind(this);

        $(window).on('scroll', this._listener);;
    },

    removeListeners() {
        $(window).off('scroll', this._listener);
    },

    componentDidMount() {
        this.addListeners();
    },

    componentWillUnmount() {
        this.removeListeners();
    },

    handleToggleProduct(id) {
        const visibleProducts = {...this.state.visibleProducts};
        if(visibleProducts[id]){
            delete visibleProducts[id];
        }
        else{
            visibleProducts[id] = true;
        }
        this.setState({visibleProducts: visibleProducts})
    },

    renderRows() {
        const rows = [];
        {  this.data.products.map(product => {
            rows.push(<tr key={product._id._str} onClick={this.handleToggleProduct.bind(this, product._id._str) }>{this.fields.map(field => {
                return <td key={field}>{renderCell(product[field], product, field)}</td>
            })}</tr>);
            if(this.state.visibleProducts[product._id._str]){
                rows.push(<tr key={product._id._str+'-dropdown'}><td colSpan={this.fields.length}></td></tr>);
            }
        })  };
        return rows;
    },

    render() {
        return <div className="table-view">
            <Search handleChange={this.handleSearch}/>
            <table className="table">
                <thead>
                    <tr>
                        { this.fields.map(field => {
                            return <th key={field} onClick={this.handleSort.bind(this, field)}
                                className={this.state.sort[field] ? 'selected': ''} >{STRINGS.english[field]}</th>
                        })}
                    </tr>
                </thead>
                <tbody>
                   { this.renderRows() }
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