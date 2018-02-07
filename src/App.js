import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

const DEFAULT_QUERY = 'redux';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = (results && results[searchKey]) ? results[searchKey].hits : [];

    const updatedHits = [ ...oldHits, ...hits ];

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  async fetchSearchTopStories(searchTerm, page=0) {
    const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;
    try {
        const res = await axios.get(url);
        this.setSearchTopStories(res.data);
    } catch(e) {
        console.error(e);
        this.setState({ error: e});
    }
  }

  async componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    await this.fetchSearchTopStories(searchTerm);
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];
    const updatedHits = hits.filter(item => item.objectID !== id);
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  async onSearchSubmit(event) {
    event.preventDefault();
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      try {
        await this.fetchSearchTopStories(searchTerm);
      } catch(e) {
        console.error(e);
      }
    }


  }

  render() {
    const { searchTerm, results, searchKey, error } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search 
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        {
          error
            ?
            <div className="interactions">
              Something went wrong
            </div>
            :
            <Table
              list={list}
              onDismiss={this.onDismiss}
            />
        }


        <Button onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
          More
        </Button>
        
      </div>
    );
  }
}

const Search = ({ value, onChange, onSubmit }) => {
  return (
  <form onSubmit={onSubmit}>
    <input 
      type="text" 
      value={value}
      onChange={onChange}
    />
    <input type="submit" value="Search" />
  </form>
  );
}
  
   
  


const Table = ({ list, onDismiss }) =>
  <div className="table">
    {
      list.map(item => {
        return (
          <div key={item.objectID} className="table-row">
            <span style={{ width: '40%' }} >
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: '30%' }}>
              {item.author}
            </span>
            <span style={{ width: '10%' }}>
              {item.num_comments}
            </span>
            <span style={{ width: '10%' }}>
              {item.points}
            </span>
            <span style={{ width: '10%' }}>
              <Button 
                onClick={() =>onDismiss(item.objectID)}
                className="button-inline"
              >
                Dismiss
              </Button>
            </span>
          </div>
        );
      })
    }
  </div>

const Button = ({ onClick, className = '', children }) => {
  return(
    <button
      onClick={onClick}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
}

export default App;
