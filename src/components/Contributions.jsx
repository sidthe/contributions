let React = require('react');
let nanoajax = require('nanoajax');
let mui = require('material-ui');
let Table = require('./Table.jsx');

const ThemeManager = new mui.Styles.ThemeManager();


var Contributions = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  getInitialState: function () {
    return {};
  },

  componentDidMount: function () {
    nanoajax.ajax('/api/v1/contributions', (code, results) => {
      if (this.isMounted()) {
        this.setState(JSON.parse(results));
      }
    });
  },

  render: function () {
    return (
      <Table contributions={this.state}/>
    );
  }
});

module.exports = Contributions;


