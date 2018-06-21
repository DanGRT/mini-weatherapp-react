import React from "react";
import PropTypes from "prop-types";

import Header from "./header";
import Photo from "./photo/index";
import Info from "./info/index";
import Thumbs from "./thumbs/index";
import Search from "./search/index";

import s from "./app.scss"

class App extends React.Component {
  constructor(props) {
    super();

    this.apiWeather = props.config.api.weather;
    this.apiUnsplash = props.config.api.unsplash;

    this.state = {
      city: "",
      weather: "",
      conditions: {},
      images: [],
      mainIndex: 0
    };

    this.fetchImages = this.fetchImages.bind(this);
    this.onThumbClick = this.onThumbClick.bind(this);
    this.onCitySearch = this.onCitySearch.bind(this);
  }

  // Data loading methods
  //----------------------------------------------------------------------------
  loadWeatherImages(city) {
    this.fetchCityConditions(city).then(this.fetchImages);
  }

  // Step 1
  fetchCityConditions(city) {
    const { apiKey, url } = this.apiWeather;
    const endpoint = `${url}?q=${city}&appid=${apiKey}`;

    return fetch(endpoint)
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then(conditions => {
        const weather = conditions.weather[0].description;
        this.setState({ conditions, weather });
        return weather;
      })
      .catch(err => console.log(err));
  }

  // Step 2
  fetchImages(weather) {
    const { url, apiKey } = this.apiUnsplash;
    const endpoint = `${url}?query=${weather}&client_id=${apiKey}&per_page=10`;

    return fetch(endpoint)
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => this.setState({ images: data.results }))
      .catch(err => console.log(err));
  }

  // Event handlers
  //----------------------------------------------------------------------------
  onThumbClick(mainIndex) {
    this.setState({ mainIndex });
  }

  onCitySearch(city) {
    this.loadWeatherImages(city);
  }

  // React lifecycle methods
  //----------------------------------------------------------------------------
  // Load data automatically
  componentDidMount() {
    this.loadWeatherImages(this.apiWeather.city);
  }

  // Respond to changes in data
  render() {
    const { mainIndex, images } = this.state;

    const mainImage = images[mainIndex] || this.props.defaultImage;
    const user = {
      name: mainImage.user.name,
      url: mainImage.user.links.html
    };
    const photos = images.map(image => ({
      id: image.id,
      url: image.urls.thumb,
      href: image.links.html
    }));

    return (
      <div className={s.content}>
        <Header />
        <Photo url={mainImage.urls.regular} />
        <Info conditions={this.state.weather} user={user} />
        <Thumbs photos={photos} onClick={this.onThumbClick} />
        <Search
          initialCity={this.apiWeather.city}
          onSubmit={this.onCitySearch}
        />
      </div>
    );
  }
}

App.propTypes = {
  config: PropTypes.shape({
    api: PropTypes.shape({
      weather: PropTypes.string,
      unsplash: PropTypes.string
    })
  }),
  defaultImage: PropTypes.shape({
    urls: PropTypes.shape({ regular: PropTypes.string }),
    user: PropTypes.shape({
      name: PropTypes.string,
      links: PropTypes.shape({ html: PropTypes.string })
    })
  })
};

App.defaultProps = {
  defaultImage: {
    urls: { regular: "" },
    user: { name: "", links: { html: "" } }
  }
};

export default App;
