module.exports = {
  getPaginatedResponseFromMongoDBWithPopulation: function (model, populate) {
    return async function (req, res, next) {
      const page = req.params.page;
      const limit = req.params.limit;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const response = {};
      const numberOfDocuments = await model.countDocuments().exec();

      /* References:
       * https://stackoverflow.com/a/31550321
       * https://mongoosejs.com/docs/promises.html
       */
      if (
        startIndex === numberOfDocuments ||
        (endIndex > numberOfDocuments &&
          endIndex > numberOfDocuments + (limit - (numberOfDocuments % limit)))
      ) {
        return res.status(404).json({
          pagination: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      }

      if (endIndex < numberOfDocuments) {
        response.next = {
          page: page + 1,
          limit: limit,
        };
      }

      if (startIndex > 0) {
        response.previous = {
          page: page - 1,
          limit: limit,
        };
      }

      response.totalPages = Math.ceil(numberOfDocuments / limit);

      try {
        response.response = await model
          .find()
          .skip(startIndex)
          .limit(limit)
          .populate(populate.path, populate.select)
          .exec();
        res.paginatedResponse = response;
        next();
      } catch (err) {
        return res.status(500).json({
          pagination: {
            msg:
              "There was an issue processing the request. Please try again later.",
          },
        });
      }
    };
  },
};
