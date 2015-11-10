
Search = React.createClass({
    render() {
        return <form>
            <input type="text" className="form-control input-lg" placeholder="Search..." />
        </form>

    }
})


TableView = React.createClass({
    render() {
        return <div className="table-view">
            <Search />
        </div>

    }
})


App = React.createClass({
   mixins: [ReactMeteorData],


 getMeteorData() {
    return {
      tasks: Tasks.find({}, {sort: {createdAt: -1}}).fetch()
    }
  },

  renderTasks() {
    return this.data.tasks.map((task) => {
      return <Task key={task._id} task={task} />;
    });
  },

 handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    var text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Tasks.insert({
      text: text,
      createdAt: new Date() // current time
    });

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = "";
  },

  render() {
    return (<div>
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