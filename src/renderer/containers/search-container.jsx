import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { IconButton } from 'material-ui';
import * as SvgIcons from 'material-ui/svg-icons';
import * as ActionCreators from '../actions';
import SearchList from '../components/search-list';

const styles = {
  container: {
    boxSizing: 'border-box',
    height: '100%',
    overflow: 'hidden',
  },
  content: {
    height: '100%',
    overflow: 'auto',
  },
  buttonWrapper: {
    position: 'absolute',
    right: '0',
    top: '0',
  },
  button: {
    height: '58px',
    padding: '17px',
    width: '58px',
  },
};

function mapStateToProps(state) {
  return {
    groups: state.groups,
    query: state.query,
  };
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(ActionCreators, dispatch) };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class SearchContainers extends Component {
  static propTypes = {
    groups: PropTypes.arrayOf(PropTypes.object).isRequired,
    query: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };
  get items() {
    const { query } = this.props;

    return this.props.groups.reduce((previous, current) => (
      previous.concat((current.hosts || []).map(host => (
        { group: current, host }
      )))
    ), [])
    .filter((item) => {
      if (query === '') {
        return true;
      }
      if ((item.host.host || '').indexOf(query) > -1) {
        return true;
      }
      if ((item.host.ip || '').indexOf(query) > -1) {
        return true;
      }
      return false;
    });
  }
  handleClickIconButton() {
    this.props.history.push('/');
  }
  handleSelectItems(ids) {
    const [groupIds, hostIds] = ids.reduce((previous, current) => (
      previous.map((item, index) => (
        item.concat([current[index]])
      ))
    ), [[], []]);
    this.props.actions.selectGroups(groupIds);
    this.props.actions.selectHosts(hostIds);
    this.props.history.push('/');
  }
  handleSearchItems(query) {
    this.props.actions.searchItems(query);
  }
  render() {
    const { query } = this.props;

    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div className="list">
            <SearchList
              items={this.items}
              query={query}
              onSelectItems={selectedItems => this.handleSelectItems(selectedItems)}
              onSearchItems={newQuery => this.handleSearchItems(newQuery)}
            />
          </div>
        </div>
        <div style={styles.buttonWrapper}>
          <IconButton
            style={styles.button}
            onClick={() => this.handleClickIconButton()}
          >
            <SvgIcons.NavigationClose />
          </IconButton>
        </div>
      </div>
    );
  }
}
