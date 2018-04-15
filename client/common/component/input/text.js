import React from 'react';
import PropTypes from 'prop-types';

class InputText extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    this.props.onChange(value);
  }
}

InputText.propTypes = {
  onChange: PropTypes.func,
};

export default InputText;
