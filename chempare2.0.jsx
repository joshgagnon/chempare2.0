
Products = new Mongo.Collection("products");

if(Meteor.isServer){
    Meteor.publish("products", function (query, sort, limit) {
        console.log('query',query || {}, {limit, sort})
        return Products.find(query || {}, {limit, sort});
        // , 'cas', 'mol_weight', 'price', 'amount', 'price_per_unit', 'url'
       /* return Products.aggregate([{_id : {product_name, cas, mol_weight, price, price_per_unit}
                                   url: '$push'
                                  },                                  );*/
  });

    function queryPubmed(product, callback){
        const url = "https://www.ncbi.nlm.nih.gov/pccompound?term="+product.cas;
        HTTP.call("GET", url, callback);
        console.log('GETTING', url)
    }

    function  pubmedInfo(cid){
        const url = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/'+cid+'/JSON/';
        HTTP.call("GET", url, callback);
        console.log('GETTING', url)
    }
//




    const wrappedQueryPubmed = Meteor.wrapAsync(queryPubmed);
    const wrappedPubmedInfo = Meteor.wrapAsync(pubmedInfo);

    Meteor.methods({
        getPubmed: function(product){
            const result = wrappedQueryPubmed(product);
            const $ = cheerio.load(result.content);
            let cid;
            console.log('FETCHED')
            if($('body').data('pubchem-id')){
                cid = $('body').data('pubchem-id');
            }
            else if($('.rsltcont .title a')){
                const matches = /(\d)+$/g.exec$('.rsltcont .title a').attr('href');
                if(matches.length){
                    cid = matches[1];
                }
            }

            if(cid){
                console.log("FOUND PUBMED_ID", product)
                Products.update(product._id, { $set: { imgUrl: 'https://pubchem.ncbi.nlm.nih.gov/image/imagefly.cgi?cid='+cid+'&width=200&height=200', pubmedId: cid }});
                pubmedInfo(cid);
            }

        }
    })
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

