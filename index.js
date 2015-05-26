'use strict';

var React = require('react-native');

var NavBarContainer = require('./components/NavBarContainer');

var {
  StyleSheet,
  Navigator,
  StatusBarIOS,
  View,
} = React;


var Router = React.createClass({

  getInitialState: function() {
    return {
      route: {
        name: null,
        index: null
      },
      hidden: this.props.hideNavBar || false,
      dragStartX: null,
      didSwitchView: null,
    }
  },

  hideNavBar: function() {
      this.setState({ hidden: true });
  },

  showNavBar: function() {
      this.setState({ hidden: false });
  },

  onWillFocus: function(route) {
    this.setState({ route: route });
  },

  onBack: function(navigator) {
    if (this.state.route.index > 0) {
      navigator.pop();
    }
  },

  onForward: function(route, navigator) {
    route.index = this.state.route.index + 1 || 1;
    navigator.push(route);
  },

  customAction: function(opts) {
    this.props.customAction(opts);
  },

  renderScene: function(route, navigator) {

    var goForward = function(route) {
      route.index = this.state.route.index + 1 || 1;
      navigator.push(route);
    }.bind(this);

    var goBackwards = function() {
      this.onBack(navigator);
    }.bind(this);

    var customAction = function(opts) {
      this.customAction(opts);
    }.bind(this);

    var didStartDrag = function(evt) {
      var x = evt.nativeEvent.pageX;
      if (x < 28) {
        this.setState({
          dragStartX: x,
          didSwitchView: false
        });
        return true;
      }
    }.bind(this);

    // Recognize swipe back gesture for navigation
    var didMoveFinger = function(evt) {
      var draggedAway = ((evt.nativeEvent.pageX - this.state.dragStartX) > 30);
      if (!this.state.didSwitchView && draggedAway) {
        this.onBack(navigator);
        this.setState({ didSwitchView: true });
      }
    }.bind(this);

    // Set to false to prevent iOS from hijacking the responder
    var preventDefault = function(evt) {
      return true;
    };

    var Content = route.component;

    var stylesArray = [styles.container, this.props.bgStyle];
    if (this.state.hidden) {
        stylesArray.push(styles.hiddenNavBar);
    }

    return (
      <View
        style={stylesArray}
        onStartShouldSetResponder={didStartDrag}
        onResponderMove={didMoveFinger}
        onResponderTerminationRequest={preventDefault}>
        <Content
          name={route.name}
          index={route.index}
          data={route.data}
          toRoute={goForward}
          toBack={goBackwards}
          hideNavBar={this.hideNavBar}
          showNavBar={this.showNavBar}
          customAction={customAction}
        />
      </View>
    )

  },

  renderNavBar: function() {
      if (!this.state.hidden) {
          return (
              <NavBarContainer
                style={this.props.headerStyle}
                navigator={navigator}
                currentRoute={this.state.route}
                backButtonComponent={this.props.backButtonComponent}
                rightCorner={this.props.rightCorner}
                titleStyle={this.props.titleStyle}
                toRoute={this.onForward}
                toBack={this.onBack}
                customAction={this.customAction}
              />
          );
      }

      return <View/>;
  },

  render: function() {

    StatusBarIOS.setStyle(1);

    return (
      <Navigator
        initialRoute={this.props.firstRoute}
        navigationBar={
            this.renderNavBar()
        }
        renderScene={this.renderScene}
        onWillFocus={this.onWillFocus}
      />
    )
  }
});


var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    marginTop: 64,
  },
  hiddenNavBar: {
    marginTop: 0,
  }
});

module.exports = Router;
