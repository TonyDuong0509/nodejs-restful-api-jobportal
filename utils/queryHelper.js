const CustomError = require("./../errors");

const applyFiltering = (queryObj, req) => {
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);

  let queryString = JSON.stringify(queryObj);
  queryString = queryString.replace(
    /\b(gte|gt|lte|lt)\b/g,
    (match) => `$${match}`
  );

  const finalQuery = JSON.parse(queryString);

  // Hardcode for search job
  if (queryObj.title) {
    const regexTitle = new RegExp(queryObj.title, "i");
    finalQuery.title = { $regex: regexTitle };
  }

  if (queryObj.skills) {
    const regexSkills = new RegExp(queryObj.skills, "i");
    finalQuery.skills = { $regex: regexSkills };
  }

  return finalQuery;
};

const applySorting = (query, req) => {
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  return query;
};

const applyFields = (query, req) => {
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  return query;
};

const applyPagination = async (query, req) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 6;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  return { query, page, limit, skip };
};

const queryHelper = async (
  Model,
  req,
  populateOptions = null,
  selectedFields = null
) => {
  const queryObj = { ...req.query };

  const filtering = applyFiltering(queryObj, req);
  let query = Model.find(filtering);

  query = applySorting(query, req);

  if (selectedFields) {
    query = query.select(selectedFields);
  } else {
    query = applyFields(query, req);
  }

  const {
    query: paginatedQuery,
    page,
    limit,
    skip,
  } = await applyPagination(query, req);

  const modelsCount = await Model.countDocuments(filtering);

  if (page) {
    if (skip >= modelsCount) {
      throw new CustomError.BadRequestError("The page does not exist");
    }
  }

  const totalPages = Math.ceil(modelsCount / limit);

  if (populateOptions) {
    paginatedQuery.populate(populateOptions);
  }

  const docs = await paginatedQuery;
  return { docs, page, limit, totalPages };
};

module.exports = queryHelper;
