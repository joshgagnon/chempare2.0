
Products = new Mongo.Collection("products");

if(Meteor.isServer){
    Meteor.publish("products", function (query, sort, limit) {
        console.log('query',query || {}, {limit, sort})
        return Products.find(query || {}, {limit, sort});
        // , 'cas', 'mol_weight', 'price', 'amount', 'price_per_unit', 'url'
       /* return Products.aggregate([{_id : {product_name, cas, mol_weight, price, price_per_unit}
                                   url: '$push'
                                  },
                                  );*/
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

