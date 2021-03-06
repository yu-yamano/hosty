import { handleActions, combineActions } from 'redux-actions';
import * as ActionTypes from '../actions';
import * as Group from '../utils/group';
import * as Host from '../utils/host';

function getTitle(groups, selectedIds) {
  const selectedId = selectedIds[0] || 0;
  const selectedGroup = groups.find(group => group.id === selectedId);
  return selectedGroup ? selectedGroup.name : '';
}

export default handleActions({
  [ActionTypes.UPDATE_GROUP]: (state) => {
    const { selectedIds } = state.groupContainer;
    return Object.assign({}, state, {
      titleContainer: {
        ...state.titleContainer,
        title: getTitle(state.groups, selectedIds),
      },
    });
  },
  [ActionTypes.ENABLE_GROUPS]: (state) => {
    const { selectedIds } = state.groupContainer;
    return Object.assign({}, state, {
      groups: state.groups.map((group) => {
        if (!selectedIds.includes(group.id)) {
          return group;
        }
        return Object.assign({}, group, { enable: true });
      }),
    });
  },
  [ActionTypes.DISABLE_GROUPS]: (state) => {
    const { selectedIds } = state.groupContainer;
    return Object.assign({}, state, {
      groups: state.groups.map((group) => {
        if (!selectedIds.includes(group.id)) {
          return group;
        }
        return Object.assign({}, group, { enable: false });
      }),
    });
  },
  [ActionTypes.DELETE_GROUPS]: (state) => {
    const { selectedIds } = state.groupContainer;
    const lastIndex = state.groups.reduce((p, c, i) => (
      selectedIds.includes(c.id) ? i : p
    ), null);
    const selectedIndex = lastIndex < state.groups.length - 1 ? lastIndex + 1 : lastIndex - 1;
    const newGroup = state.groups[selectedIndex];
    const newSelectedIds = newGroup ? [newGroup.id] : [];
    return Object.assign({}, state, {
      groups: state.groups.filter(group => !selectedIds.includes(group.id)),
      titleContainer: {
        ...state.titleContainer,
        title: getTitle(state.groups, newSelectedIds),
      },
      groupContainer: {
        ...state.groupContainer,
        selectedIds: newSelectedIds,
      },
      hostContainer: {
        ...state.hostContainer,
        selectedIds: [],
        sortOptions: {},
      },
    });
  },
  [ActionTypes.CUT_GROUPS]: (state) => {
    const { selectedIds } = state.groupContainer;
    const lastIndex = state.groups.reduce((p, c, i) => (
      selectedIds.includes(c.id) ? i : p
    ), null);
    const selectedIndex = lastIndex < state.groups.length - 1 ? lastIndex + 1 : lastIndex - 1;
    const newGroup = state.groups[selectedIndex];
    const newSelectedIds = newGroup ? [newGroup.id] : [];
    return Object.assign({}, state, {
      groups: state.groups.filter(group => !selectedIds.includes(group.id)),
      titleContainer: {
        ...state.titleContainer,
        title: getTitle(state.groups, newSelectedIds),
      },
      groupContainer: {
        ...state.groupContainer,
        selectedIds: newSelectedIds,
        copiedGroups: state.groups.filter(group => selectedIds.includes(group.id)),
      },
      hostContainer: {
        ...state.hostContainer,
        selectedIds: [],
        sortOptions: {},
        copiedHosts: [],
      },
    });
  },
  [ActionTypes.COPY_GROUPS]: (state) => {
    const { selectedIds } = state.groupContainer;
    return Object.assign({}, state, {
      groupContainer: {
        ...state.groupContainer,
        copiedGroups: state.groups.filter(group => selectedIds.includes(group.id)),
      },
      hostContainer: {
        ...state.hostContainer,
        copiedHosts: [],
      },
    });
  },
  [ActionTypes.PASTE_GROUPS]: (state) => {
    const { copiedGroups } = state.groupContainer;
    const maxId = state.groups.reduce((p, c) => (c.id > p ? c.id : p), 0);
    const newGroups = copiedGroups.map((group, i) => (
      Object.assign({}, group, { id: maxId + i + 1 })
    ));
    return Object.assign({}, state, {
      groups: [...state.groups, ...newGroups],
    });
  },
  [ActionTypes.FOCUS_GROUP]: (state) => {
    const { groups: newGroups } = state;
    const group = newGroups[newGroups.length - 1];
    if (!group) {
      return state;
    }
    return Object.assign({}, state, {
      groupContainer: {
        ...state.groupContainer,
        focusedId: group.id,
        selectedIds: [group.id],
      },
    });
  },
  [ActionTypes.SELECT_GROUP]: (state, action) => {
    const { id, option } = action.payload;
    const { selectedIds } = state.groupContainer;

    const newSelectedIds = (() => {
      switch (option) {
        case 'shift': {
          const lastId = selectedIds.length
            ? selectedIds[selectedIds.length - 1] : 0;
          let lastIndex = state.groups.findIndex(group => group.id === lastId);
          let firstIndex = state.groups.findIndex(group => group.id === id);
          if (firstIndex > lastIndex) {
            [firstIndex, lastIndex] = [lastIndex, firstIndex];
          }
          const groupIds = state.groups.filter((group, i) => (
            firstIndex <= i && i <= lastIndex
          ))
            .map(group => group.id)
            .filter(currentId => !selectedIds.includes(currentId));
          return [...selectedIds, ...groupIds];
        }
        case 'ctrl': {
          if (selectedIds.includes(id)) {
            return selectedIds.filter(currentId => (
              currentId !== id
            ));
          }
          return [...selectedIds, id];
        }
        case 'rightClick': {
          if (selectedIds.includes(id)) {
            return selectedIds;
          }
          return [id];
        }
        default:
          return [id];
      }
    })();

    return Object.assign({}, state, {
      titleContainer: {
        ...state.titleContainer,
        title: getTitle(state.groups, newSelectedIds),
      },
      groupContainer: {
        ...state.groupContainer,
        selectedIds: newSelectedIds,
      },
      hostContainer: {
        ...state.hostContainer,
        selectedIds: [],
        sortOptions: {},
      },
    });
  },
  [ActionTypes.CREATE_HOST]: (state) => {
    const { selectedIds: selectedGroupIds } = state.groupContainer;
    const selectedGroupId = selectedGroupIds[0];
    if (!selectedGroupId) {
      return state;
    }
    return Object.assign({}, state, {
      groups: state.groups.map((group) => {
        if (group.id !== selectedGroupId) {
          return group;
        }
        const newGroup = Object.assign({}, group);
        if (!newGroup.hosts) {
          newGroup.hosts = [];
        }
        const maxId = newGroup.hosts.reduce((p, c) => (c.id > p ? c.id : p), 0);
        const host = {
          id: maxId + 1,
          enable: true,
          host: '',
          ip: '',
        };
        newGroup.hosts = [...newGroup.hosts, host];
        return newGroup;
      }),
    });
  },
  [ActionTypes.UPDATE_HOST]: (state, action) => {
    const { selectedIds: selectedGroupIds } = state.groupContainer;
    const { id, host } = action.payload;
    const selectedGroupId = selectedGroupIds[0];
    if (!selectedGroupId) {
      return state;
    }
    return Object.assign({}, state, {
      groups: state.groups.map((group) => {
        if (group.id !== selectedGroupId) {
          return group;
        }
        const newGroup = Object.assign({}, group);
        if (!newGroup.hosts) {
          newGroup.hosts = [];
        }
        newGroup.hosts = newGroup.hosts.map(currentHost => (
          currentHost.id !== id ? currentHost : host
        ));
        return newGroup;
      }),
    });
  },
  [ActionTypes.ENABLE_HOSTS]: (state) => {
    const { selectedIds: selectedGroupIds } = state.groupContainer;
    const { selectedIds } = state.hostContainer;
    const selectedGroupId = selectedGroupIds[0];
    if (!selectedGroupId) {
      return state;
    }
    return Object.assign({}, state, {
      groups: state.groups.map((group) => {
        if (group.id !== selectedGroupId) {
          return group;
        }
        const newGroup = Object.assign({}, group);
        if (!newGroup.hosts) {
          newGroup.hosts = [];
        }
        newGroup.hosts = newGroup.hosts.map((currentHost) => {
          if (!selectedIds.includes(currentHost.id)) {
            return currentHost;
          }
          return Object.assign({}, currentHost, { enable: true });
        });
        return newGroup;
      }),
    });
  },
  [ActionTypes.DISABLE_HOSTS]: (state) => {
    const { selectedIds: selectedGroupIds } = state.groupContainer;
    const { selectedIds } = state.hostContainer;
    const selectedGroupId = selectedGroupIds[0];
    if (!selectedGroupId) {
      return state;
    }
    return Object.assign({}, state, {
      groups: state.groups.map((group) => {
        if (group.id !== selectedGroupId) {
          return group;
        }
        const newGroup = Object.assign({}, group);
        if (!newGroup.hosts) {
          newGroup.hosts = [];
        }
        newGroup.hosts = newGroup.hosts.map((currentHost) => {
          if (!selectedIds.includes(currentHost.id)) {
            return currentHost;
          }
          return Object.assign({}, currentHost, { enable: false });
        });
        return newGroup;
      }),
    });
  },
  [ActionTypes.DELETE_HOSTS]: (state) => {
    const { selectedIds: selectedGroupIds } = state.groupContainer;
    const { selectedIds } = state.hostContainer;
    const selectedGroupId = selectedGroupIds[0];
    if (!selectedGroupId) {
      return state;
    }
    const group = state.groups.find(currentGroup => currentGroup.id === selectedGroupId);
    if (!group) {
      return state;
    }
    const hosts = group.hosts || [];
    const lastIndex = hosts.reduce((p, c, i) => (
      selectedIds.includes(c.id) ? i : p
    ), null);
    const selectedIndex = lastIndex < hosts.length - 1 ? lastIndex + 1 : lastIndex - 1;
    const newHost = hosts[selectedIndex];
    const newSelectedIds = newHost ? [newHost.id] : [];
    return Object.assign({}, state, {
      groups: state.groups.map((currentGroup) => {
        if (currentGroup.id !== selectedGroupId) {
          return currentGroup;
        }
        return Object.assign({}, currentGroup, {
          hosts: (currentGroup.hosts || []).filter(host => (
            !selectedIds.includes(host.id)
          )),
        });
      }),
      hostContainer: {
        ...state.hostContainer,
        selectedIds: newSelectedIds,
      },
    });
  },
  [ActionTypes.CUT_HOSTS]: (state) => {
    const { selectedIds: selectedGroupIds } = state.groupContainer;
    const { selectedIds } = state.hostContainer;
    const selectedGroupId = selectedGroupIds[0];
    if (!selectedGroupId) {
      return state;
    }
    const group = state.groups.find(currentGroup => currentGroup.id === selectedGroupId);
    if (!group) {
      return state;
    }
    const hosts = group.hosts || [];
    const lastIndex = hosts.reduce((p, c, i) => (
      selectedIds.includes(c.id) ? i : p
    ), null);
    const selectedIndex = lastIndex < hosts.length - 1 ? lastIndex + 1 : lastIndex - 1;
    const newHost = hosts[selectedIndex];
    const newSelectedIds = newHost ? [newHost.id] : [];
    return Object.assign({}, state, {
      groups: state.groups.map((currentGroup) => {
        if (currentGroup.id !== selectedGroupId) {
          return currentGroup;
        }
        return Object.assign({}, currentGroup, {
          hosts: (currentGroup.hosts || []).filter(host => (
            !selectedIds.includes(host.id)
          )),
        });
      }),
      groupContainer: {
        ...state.groupContainer,
        copiedGroups: [],
      },
      hostContainer: {
        ...state.hostContainer,
        selectedIds: newSelectedIds,
        copiedHosts: hosts.filter(host => selectedIds.includes(host.id)),
      },
    });
  },
  [ActionTypes.COPY_HOSTS]: (state) => {
    const { selectedIds: selectedGroupIds } = state.groupContainer;
    const { selectedIds } = state.hostContainer;
    const selectedGroupId = selectedGroupIds[0];
    if (!selectedGroupId) {
      return state;
    }
    const group = state.groups.find(currentGroup => currentGroup.id === selectedGroupId);
    if (!group) {
      return state;
    }
    const hosts = group.hosts || [];
    return Object.assign({}, state, {
      groupContainer: {
        ...state.groupContainer,
        copiedGroups: [],
      },
      hostContainer: {
        ...state.hostContainer,
        copiedHosts: hosts.filter(host => selectedIds.includes(host.id)),
      },
    });
  },
  [ActionTypes.PASTE_HOSTS]: (state) => {
    const { selectedIds: selectedGroupIds } = state.groupContainer;
    const { copiedHosts } = state.hostContainer;
    const selectedGroupId = selectedGroupIds[0];
    if (!selectedGroupId) {
      return state;
    }
    return Object.assign({}, state, {
      groups: state.groups.map((group) => {
        if (group.id !== selectedGroupId) {
          return group;
        }
        const newGroup = Object.assign({}, group);
        if (!newGroup.hosts) {
          newGroup.hosts = [];
        }
        const maxId = newGroup.hosts.reduce((p, c) => (c.id > p ? c.id : p), 0);
        const newHosts = copiedHosts.map((host, i) => (
          Object.assign({}, host, { id: maxId + i + 1 })
        ));
        newGroup.hosts = [...newGroup.hosts, ...newHosts];
        return newGroup;
      }),
    });
  },
  [ActionTypes.SORT_HOSTS]: (state, action) => {
    const { selectedIds: selectedGroupIds } = state.groupContainer;
    const { options } = action.payload;
    const selectedGroupId = selectedGroupIds[0];
    if (!selectedGroupId) {
      return state;
    }
    return Object.assign({}, state, {
      groups: state.groups.map((group) => {
        if (group.id !== selectedGroupId) {
          return group;
        }
        const newGroup = Object.assign({}, group);
        if (!newGroup.hosts) {
          newGroup.hosts = [];
        }
        newGroup.hosts = newGroup.hosts.concat().sort((a, b) => {
          if (!a[Host.KEY_HOST]) {
            return 1;
          }
          if (!b[Host.KEY_HOST]) {
            return -1;
          }
          const result = Host.compare(a, b, options);
          if (result !== 0) {
            return result;
          }
          return Host.compare(a, b, { key: Host.KEY_ID, order: Host.SORT_ASC });
        });
        return newGroup;
      }),
    });
  },
  [ActionTypes.FOCUS_HOST]: (state) => {
    const { selectedIds: selectedGroupIds } = state.groupContainer;
    const group = state.groups.find(currentGroup => (
      currentGroup.id === selectedGroupIds[0]
    ));
    if (!group) {
      return state;
    }
    const host = group.hosts[group.hosts.length - 1];
    if (!host) {
      return state;
    }
    return Object.assign({}, state, {
      hostContainer: {
        ...state.hostContainer,
        focusedId: host.id,
        selectedIds: [host.id],
      },
    });
  },
  [ActionTypes.SELECT_HOST]: (state, action) => {
    const { id, option } = action.payload;
    const { selectedIds: selectedGroupIds } = state.groupContainer;
    const { selectedIds } = state.hostContainer;
    const group = state.groups.find(currentGroup => (
      currentGroup.id === selectedGroupIds[0]
    ));
    const hosts = (group ? group.hosts : []) || [];
    return Object.assign({}, state, {
      hostContainer: {
        ...state.hostContainer,
        selectedIds: (() => {
          switch (option) {
            case 'shift': {
              const lastId = selectedIds.length
                ? selectedIds[selectedIds.length - 1] : 0;
              let lastIndex = hosts.findIndex(host => host.id === lastId);
              let firstIndex = hosts.findIndex(host => host.id === id);
              if (firstIndex > lastIndex) {
                [firstIndex, lastIndex] = [lastIndex, firstIndex];
              }
              const hostIds = hosts.filter((host, i) => (
                firstIndex <= i && i <= lastIndex
              ))
                .map(host => host.id)
                .filter(currentId => !selectedIds.includes(currentId));
              return [...selectedIds, ...hostIds];
            }
            case 'ctrl': {
              if (selectedIds.includes(id)) {
                return selectedIds.filter(currentId => (
                  currentId !== id
                ));
              }
              return [...selectedIds, id];
            }
            case 'rightClick': {
              if (selectedIds.includes(id)) {
                return selectedIds;
              }
              return [id];
            }
            default:
              return [id];
          }
        })(),
      },
    });
  },
  [combineActions(ActionTypes.FIND_HOSTS, ActionTypes.SET_REGEXP_ENABLED)]: (state) => {
    const { query, regExpEnabled } = state.findContainer;
    const pattern = regExpEnabled ? query : RegExp.escape(query);
    const regexp = RegExp(pattern, 'i');
    return Object.assign({}, state, {
      findContainer: {
        ...state.findContainer,
        results: state.groups.map((group) => {
          const newGroup = Object.assign({}, group);
          if (!newGroup.hosts) {
            newGroup.hosts = [];
          }
          newGroup.hosts = newGroup.hosts.filter((host) => {
            if (query === '') {
              return false;
            }
            return regexp.test(host.host || '') || regexp.test(host.ip || '');
          })
            .sort((a, b) => Host.compare(a, b, { key: Host.KEY_HOST, order: Group.SORT_ASC }));
          return newGroup;
        })
          .filter(group => group.hosts.length)
          .sort((a, b) => Group.compare(a, b, { key: Group.KEY_NAME, order: Group.SORT_ASC })),
      },
    });
  },
}, {});
