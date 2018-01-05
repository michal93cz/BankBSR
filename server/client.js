var soap = require('soap');

var url = 'http://localhost:8001/wsdl?wsdl';
var args = {name: 'value'};

soap.createClient(url, function(err, client) {
    client.DefaultNamespace(args, function(err, result) {
        console.log(result);
    });
});
