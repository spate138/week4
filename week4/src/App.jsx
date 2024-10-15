import { useState, useEffect } from 'react';
import './App.css';

const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

function App() {
  const [catData, setCatData] = useState(null);  // Store cat data
  const [banList, setBanList] = useState([]);    // Store ban list items
  const [history, setHistory] = useState([]);    // Store previously seen cats
  const [isFirstLoad, setIsFirstLoad] = useState(true);  // Track if it's the first load

  // Fetch a random cat from the API with the `has_breeds=1` parameter to ensure only cats with breed info are returned
  const fetchCat = async () => {
    try {
      const response = await fetch(`https://api.thecatapi.com/v1/images/search?has_breeds=1&api_key=${ACCESS_KEY}`);
      const data = await response.json();
      const cat = data[0]; // get the first (random) result
      return cat;
    } catch (error) {
      console.error("Error fetching cat data: ", error);
      return null;
    }
  };

  // Function to add to ban list without affecting the current cat
  const addToBanList = (attribute) => {
    if (!banList.includes(attribute)) {
      setBanList([...banList, attribute]);
    }
  };

  // Function to remove an attribute from the ban list
  const removeFromBanList = (attribute) => {
    const updatedBanList = banList.filter(item => item !== attribute);
    setBanList(updatedBanList);
  };

  // Check if the current cat contains any banned attributes
  const isCatBanned = (cat) => {
    if (!cat || !cat.breeds || cat.breeds.length === 0) return false;
    const breed = cat.breeds[0];
    return (
      banList.includes(breed.origin) ||
      banList.includes(`${breed.weight.metric} lbs`) ||
      banList.includes(breed.name) ||
      banList.includes(`${breed.life_span} years`)
    );
  };

  // Handle discover button and check for banned cats
  const handleDiscover = async () => {
    let cat;
    do {
      cat = await fetchCat();
      if (!cat) break;  // Break if there's an error fetching a cat
    } while (cat && isCatBanned(cat));  // Continue fetching while the cat is banned

    if (cat && !isCatBanned(cat)) {
      setCatData(cat);
      setHistory((prevHistory) => [...prevHistory, cat]);
      setIsFirstLoad(false);  // Set first load to false after fetching the first cat
    }
  };

  return (
    <>
      <div className="whole-page">
        <h1>Trippin' on Cats</h1>
        <h3>Discover cats from your wildest dreams!</h3>
        😺😸😹😻😼😽🙀😿😾
        <br /><br />

        {/* Discover Container */}
        <div className="discover-container">
          {isFirstLoad ? (
            // Initial state when no cat has been fetched yet
            <p>Click 'Discover' to start exploring cats!</p>
          ) : (
            catData && (
              <>
                <h2>{catData.breeds[0].name}</h2>
                <div className="attribute-buttons">
                  {/* Render attributes as buttons */}
                  <button className="attribute-btn" onClick={() => addToBanList(catData.breeds[0].name)}>
                    {catData.breeds[0].name}
                  </button>
                  <button className="attribute-btn" onClick={() => addToBanList(`${catData.breeds[0].weight.metric} lbs`)}>
                    {catData.breeds[0].weight.metric} lbs
                  </button>
                  <button className="attribute-btn" onClick={() => addToBanList(catData.breeds[0].origin)}>
                    {catData.breeds[0].origin}
                  </button>
                  <button className="attribute-btn" onClick={() => addToBanList(`${catData.breeds[0].life_span} years`)}>
                    {catData.breeds[0].life_span} years
                  </button>
                </div>
                <img src={catData.url} alt="Random Cat" style={{ width: '300px' }} />
                <br />
              </>
            )
          )}

          {/* Discover button */}
          <button type="button" className="discover-btn" onClick={handleDiscover}>
            🔀 Discover!
          </button>
        </div>
      </div>

      {/* Ban List */}
      <div className="sideNav">
        <h2>Ban List</h2>
        <h4>Select an attribute in your listing to ban it</h4>
        <ul>
          {banList.map((attribute, index) => (
            <li key={index}>
              <button className="ban-item-btn" onClick={() => removeFromBanList(attribute)}>
                {attribute} ❌
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* History Sidebar */}
      <div className="history-sidebar">
        <div>
          <h2>Who have we seen so far?</h2>
          <ul>
            {history.map((cat, index) => (
              <li key={index}>
                <img src={cat.url} alt="cat" style={{ width: '100px' }} />
                {cat.breeds[0].name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
