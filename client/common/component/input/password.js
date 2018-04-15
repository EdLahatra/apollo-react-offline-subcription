import React from 'react';
import PropTypes from 'prop-types';

class InputPassword extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    this.props.onChange(value);
  }
}

InputPassword.propTypes = {
  onChange: PropTypes.func,
};

export default InputPassword;
