require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Middleware setup
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// Joke API endpoint
app.get('/joke', async (req, res) => {
    try {
        const { category, name } = req.query;
        
        // Validate category - fallback to 'Any' if invalid
        const validCategories = ['Any', 'Programming', 'Misc', 'Dark', 'Pun', 'Spooky', 'Christmas'];
        const selectedCategory = validCategories.includes(category) ? category : 'Any';
        
        const url = `https://v2.jokeapi.dev/joke/${selectedCategory}?safe-mode`;
        
        const response = await axios.get(url, {
            validateStatus: function (status) {
                return status < 500; // Reject only if status is 500 or higher
            }
        });
        
        // If API returns error response (like 400)
        if (response.data.error) {
            throw new Error(response.data.message || 'No jokes found for this category');
        }

        let jokeData = response.data;
        
        // Personalize the joke if name is provided
        if (name && jokeData.setup) {
            jokeData.setup = jokeData.setup.replace(/John Doe/gi, name);
            if (jokeData.delivery) {
                jokeData.delivery = jokeData.delivery.replace(/John Doe/gi, name);
            }
        }
        
        res.render('joke', { 
            joke: jokeData, 
            name: name || '',
            error: null
        });
    } catch (error) {
        console.error('Error fetching joke:', error.message);
        res.render('joke', { 
            error: error.message || 'Failed to fetch a joke. Please try a different category.',
            joke: null,
            name: req.query.name || ''
        });
    }
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});