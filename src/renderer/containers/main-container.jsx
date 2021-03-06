import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { muiThemeable } from 'material-ui/styles';
import GroupContainer from './group-container';
import HostContainer from './host-container';
import PanelContainer from './panel-container';

const styles = {
  container: {
    height: '100%',
  },
  contentWrapper: {
    display: 'flex',
  },
  content: {
    flex: '1',
  },
  nav: {
    borderRightWidth: '1px',
    borderRightStyle: 'solid',
    width: '256px',
  },
  panelWrapper: {
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    boxSizing: 'border-box',
    height: '100%',
    position: 'relative',
  },
  draggableBar: {
    cursor: 'row-resize',
    height: '5px',
    left: '0',
    position: 'absolute',
    right: '0',
    top: '-2.5px',
  },
  panelContentWrapper: {
    boxSizing: 'border-box',
    height: '100%',
    paddingTop: '5px',
  },
};

function mapStateToProps(state) {
  return { ...state.mainContainer };
}

function mapDispatchToProps() {
  return {};
}

@muiThemeable()
@connect(mapStateToProps, mapDispatchToProps)
export default class MainContainer extends Component {
  static propTypes = {
    panelOpen: PropTypes.bool.isRequired,
    muiTheme: PropTypes.object.isRequired,
  };
  state = {
    dragging: false,
    panelY: 0,
    panelHeight: document.body.offsetHeight / 3, // eslint-disable-line no-undef
  };
  handleWrapper(e) {
    const { dragging } = this.state;
    if (dragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  handleDragStart(e) {
    const img = document.createElement('img'); // eslint-disable-line no-undef
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
    this.setState({ dragging: true, panelY: e.clientY });
  }
  handleDrag(e) {
    const { panelY, panelHeight } = this.state;
    const newHeight = panelHeight - (e.clientY - panelY);
    const minHeight = 100;
    const maxHeight = document.body.offsetHeight - 100; // eslint-disable-line no-undef
    if (newHeight < minHeight || maxHeight < newHeight) {
      return;
    }
    this.setState({ panelY: e.clientY, panelHeight: newHeight });
  }
  handleDragEnd() {
    this.setState({ dragging: false });
  }
  // render
  renderPanel() {
    const { panelOpen, muiTheme } = this.props;
    const { panelHeight } = this.state;

    if (!panelOpen) {
      return null;
    }

    return (
      <div
        style={{
          ...styles.panelWrapper,
          height: `${panelHeight}px`,
          borderTopColor: muiTheme.palette.borderColor,
        }}
      >
        <div
          draggable
          style={styles.draggableBar}
          onDrag={e => this.handleDrag(e)}
          onDragStart={e => this.handleDragStart(e)}
          onDragEnd={e => this.handleDragEnd(e)}
        />
        <div style={styles.panelContentWrapper}>
          <PanelContainer />
        </div>
      </div>
    );
  }
  render() {
    const { panelOpen, muiTheme } = this.props;
    let { panelHeight } = this.state;

    panelHeight = panelOpen ? panelHeight : 0;

    return (
      <div
        style={styles.container}
        onDragOver={e => this.handleWrapper(e)}
        onDrop={e => this.handleWrapper(e)}
      >
        <div
          style={{
            ...styles.contentWrapper,
            height: `calc(100% - ${panelHeight}px)`,
          }}
        >
          <div
            className="nav"
            style={{
              ...styles.nav,
              borderRightColor: muiTheme.palette.borderColor,
            }}
          >
            <GroupContainer />
          </div>
          <div style={styles.content}>
            <HostContainer />
          </div>
        </div>
        {this.renderPanel()}
      </div>
    );
  }
}
