
Products = new Mongo.Collection("products");

if(Meteor.isServer){
    Meteor.publish("products", function (query) {
        console.log('query')
        return Products.find(query || {}, {limit: 100});
  });
}

if (Meteor.isClient) {
    Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  // This code is executed on the client only
  Meteor.startup(function () {
    // Use Meteor.startup to render the component after the page is ready
    ReactDOM.render(<App />, document.getElementById("render-target"));
  });
}

