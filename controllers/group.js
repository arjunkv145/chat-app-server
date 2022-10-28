const getGroups = (req, res) => {
    res.json({ groups: ['art', 'music', 'anime', 'gaming', 'sports', 'writing', 'manga'] })
}

module.exports = {
    getGroups
}