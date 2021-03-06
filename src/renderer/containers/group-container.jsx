import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { muiThemeable } from 'material-ui/styles';
import * as ActionCreators from '../actions';
import GroupList from '../components/group-list';
import ContextMenu from '../utils/context-menu';

const styles = {
  emptyWrapper: {
    display: 'table',
    height: '100%',
    position: 'absolute',
    top: '0',
    width: '100%',
  },
  emptyMessage: {
    display: 'table-cell',
    fontSize: '13px',
    paddingTop: '59px',
    position: 'relative',
    textAlign: 'center',
    userSelect: 'none',
    verticalAlign: 'middle',
  },
};

function mapStateToProps(state) {
  const { copiedGroups } = state.groupContainer;

  return {
    groups: state.groups,
    pastable: !!copiedGroups.length,
    ...state.groupContainer,
  };
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(ActionCreators, dispatch) };
}

@muiThemeable()
@connect(mapStateToProps, mapDispatchToProps)
export default class GroupContainer extends Component {
  static propTypes = {
    groups: PropTypes.arrayOf(PropTypes.object).isRequired,
    pastable: PropTypes.bool.isRequired,
    focusedId: PropTypes.number.isRequired,
    selectedIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    sortOptions: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired,
  };
  handleAddGroup() {
    this.props.actions.createGroup();
    window.setTimeout(() => {
      this.props.actions.focusGroup();
    }, 0);
  }
  handleEditGroup(id, group) {
    this.props.actions.updateGroup(id, group);
  }
  handleEnableGroups() {
    this.props.actions.enableGroups();
  }
  handleDisableGroups() {
    this.props.actions.disableGroups();
  }
  handleDeleteGroups() {
    this.props.actions.deleteGroups();
  }
  handleCutGroups() {
    this.props.actions.cutGroups();
  }
  handleCopyGroups() {
    this.props.actions.copyGroups();
  }
  handlePasteGroups() {
    this.props.actions.pasteGroups();
  }
  handleSelectGroup(id, option) {
    this.props.actions.selectGroup(id, option);
  }
  handleSortGroups(options) {
    this.props.actions.sortGroups(options);
  }
  handleContextMenuForGroups(e) {
    const { pastable } = this.props;

    ContextMenu.show(e, [
      {
        label: 'New Group',
        click: () => this.handleAddGroup(),
        accelerator: 'CmdOrCtrl+Shift+N',
      },
      { type: 'separator' },
      {
        label: 'Cut',
        click: () => this.handleCutGroups(),
        accelerator: 'CmdOrCtrl+Shift+X',
      },
      {
        label: 'Copy',
        click: () => this.handleCopyGroups(),
        accelerator: 'CmdOrCtrl+Shift+C',
      },
      {
        label: 'Paste',
        click: () => this.handlePasteGroups(),
        accelerator: 'CmdOrCtrl+Shift+V',
        enabled: pastable,
      },
      { type: 'separator' },
      {
        label: 'Enable',
        click: () => this.handleEnableGroups(),
        accelerator: 'CmdOrCtrl+Shift+E',
      },
      {
        label: 'Disable',
        click: () => this.handleDisableGroups(),
        accelerator: 'CmdOrCtrl+Shift+D',
      },
      { type: 'separator' },
      {
        label: 'Delete',
        click: () => this.handleDeleteGroups(),
        accelerator: 'CmdOrCtrl+Shift+Backspace',
      },
    ]);
  }
  render() {
    const { groups, focusedId, selectedIds, sortOptions, muiTheme } = this.props;

    let emptyView = null;
    if (!groups.length) {
      emptyView = (
        <div style={styles.emptyWrapper}>
          <div style={{
            ...styles.emptyMessage,
            color: muiTheme.palette.primary3Color,
          }}
          >No groups</div>
        </div>
      );
    }

    return (
      <div
        className="list"
        onContextMenu={e => this.handleContextMenuForGroups(e)}
      >
        <GroupList
          groups={groups}
          focusedId={focusedId}
          selectedIds={selectedIds}
          sortOptions={sortOptions}
          onEditGroup={(...args) => this.handleEditGroup(...args)}
          onSelectGroup={(...args) => this.handleSelectGroup(...args)}
          onSortGroups={(...args) => this.handleSortGroups(...args)}
        />
        {emptyView}
      </div>
    );
  }
}
