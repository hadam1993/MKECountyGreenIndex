import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import PropTypes from 'prop-types';

class ButtonGroup extends React.PureComponent {
  render () {
    const { value: selectedValue, options, vertical, block, baseClassName, defaultClassName, primaryClassName, buttonProps } = this.props;

    return (
      <div className={classnames({ 'btn-group': !vertical, 'btn-group-vertical': vertical, 'btn-block': block })}>
        {
          _.map(options, (option) => {
            const { label, value } = option;
            const btnClass = classnames({
              [baseClassName || 'btn']: true,
              [defaultClassName || 'btn-light']: value !== selectedValue,
              [primaryClassName || 'btn-primary']: value === selectedValue,
            });

            return (
              <button key={value} type="button" className={btnClass} onClick={(e) => this.onClick(value, option, e)} {...buttonProps}>{label}</button>
            );
          })
        }
      </div>
    );
  }

    onClick = (value, option, e) => {
      const { onClick } = this.props;

      if (!_.isFunction(onClick)) {
        return;
      }

      onClick(value, option, e);
    }
}

ButtonGroup.propTypes = {
  value: PropTypes.any,
  options: PropTypes.array.isRequired,
  vertical: PropTypes.bool,
  block: PropTypes.bool,
  baseClassName: PropTypes.string,
  defaultClassName: PropTypes.string,
  primaryClassName: PropTypes.string,
  buttonProps: PropTypes.object,
  onClick: PropTypes.func,
};

export default ButtonGroup;
