const request = (req, res) => {
    res.json({ groups: ['art', 'music', 'anime', 'gaming', 'sports', 'writing', 'manga'] })
}

const pending = (req, res) => {
    res.json({ groups: ['art', 'music', 'anime', 'gaming', 'sports', 'writing', 'manga'] })
}

const friends = (req, res) => {
    res.json({ groups: ['art', 'music', 'anime', 'gaming', 'sports', 'writing', 'manga'] })
}

module.exports = {
    request,
    pending,
    friends
}