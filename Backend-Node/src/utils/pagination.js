function getPaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(query.per_page) || 15));
  const skip = (page - 1) * perPage;
  return { page, perPage, skip };
}

function paginateResponse(data, total, page, perPage) {
  return {
    data,
    current_page: page,
    per_page: perPage,
    total,
    last_page: Math.ceil(total / perPage),
  };
}

module.exports = { getPaginationParams, paginateResponse };
