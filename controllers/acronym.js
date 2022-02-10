const AcronymModel = require('../model/acronym')

// Create and Save a new acronym
exports.create = async (req, res) => {
    if (!req.body.acronym || !req.body.definition) {
        res.status(400).send({ message: "Acronym or definition can not be empty!" });
    }
    
    const acronym = new AcronymModel({
        acronym: req.body.acronym,
        definition: req.body.definition
    });
    
    await acronym.save().then(data => {
        res.send({
            message:"Acronym created successfully!!",
            acronym:data
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating user"
        });
    });
};

// for escaping characters in search text
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// Retrieve acronyms from the database.
exports.findAll = async (req, res, next) => {
    try {
        // If no page, limit in request parameters, fetch all acronym documents in the collection
        if(!req.query.page && !req.query.limit){
            const acronym = await AcronymModel.find();
            res.status(200).json(acronym);
        }
        else{
            // current page we are requesting
            const page = parseInt(req.query.page);
            // number of documents we wish to retrieve
            const limit = parseInt(req.query.limit);

            // Validating page number
            if(page < 0 || page === 0) {
                response = {"error" : true,"message" : "invalid page, should start with 1"};
                return res.json(response)
            }

            // Validating limit
            if(limit < 0 || limit === 0) {
                response = {"error" : true,"message" : "invalid limit, should start with 1"};
                return res.json(response)
            }

            // defining query to fetch data
            var query = {}
            query.skip = limit * (page - 1)
            query.limit = limit

            // if search parameter present
            if(req.query.search){
                // regex for fuzzy matching
                const regex = new RegExp(escapeRegex(req.query.search), 'gi');
                var _filter = {
                    // Multi field matching for acronym and definition
                    $or: [
                     {acronym: {$regex: regex}},
                     {definition: {$regex: regex}},
                    ]
                }
                
                // to count the total number of documents in the collection
                AcronymModel.count(_filter,function(err,totalCount) {
                    if(err) {
                    response = {"error" : true,"message" : "Error fetching data"}
                    }
                    // to fetch all data from collection with fuzzy matching filter and pagination
                    AcronymModel.find(_filter,{},query,function(err,data) {
                        if(err) {
                            response = {"error" : true,"message" : "Error fetching data"};
                        } else {
                            var totalPages = Math.ceil(totalCount / limit)
                            // pages to display total number of pages to indicate there are more results
                            response = {"error" : false,"message" : data,"pages": totalPages};
                        }
                        res.json(response);
                    });
                })
            }
            else{
                // to count the total number of documents in the collection
                AcronymModel.count({},function(err,totalCount) {
                    if(err) {
                    response = {"error" : true,"message" : "Error fetching data"}
                    }
                    // to fetch all data from collection with pagination
                    AcronymModel.find({},{},query,function(err,data) {
                        if(err) {
                            response = {"error" : true,"message" : "Error fetching data"};
                        } else {
                            var totalPages = Math.ceil(totalCount / limit)
                            // pages to display total number of pages to indicate there are more results
                            response = {"error" : false,"message" : data,"pages": totalPages};
                        }
                        res.json(response);
                    });
                })
            }
        }
    } catch(error) {
        res.status(404).json({message: error.message});
    }
};

// Find a single Acronym with an acronymID
exports.findOne = async (req, res) => {
    try {
        const acronym = await AcronymModel.findById(req.params.acronymID);
        res.status(200).json(acronym);
    } catch(error) {
        res.status(404).json({ message: error.message});
    }
};

// Update an Acronym by the acronymID in the request paramters
exports.update = async (req, res) => {
    if(!req.body) {
        res.status(400).send({
            message: "Data to update can not be empty!"
        });
    }
    
    const id = req.params.acronymID;
    
    await AcronymModel.findByIdAndUpdate(id, req.body, { useFindAndModify: false }).then(data => {
        if (!data) {
            res.status(404).send({
                message: `Acronym not found.`
            });
        }else{
            res.send({ message: "Acronym updated successfully." })
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message
        });
    });
};

// Delete an acronym with the specified acronymID in the request parameters
exports.destroy = async (req, res) => {
    await AcronymModel.findByIdAndRemove(req.params.acronymID).then(data => {
        if (!data) {
          res.status(404).send({
            message: `Acronym not found.`
          });
        } else {
          res.send({
            message: "Acronym deleted successfully!"
          });
        }
    }).catch(err => {
        res.status(500).send({
          message: err.message
        });
    });
};