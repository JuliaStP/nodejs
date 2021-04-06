import React, { useState } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Typography, Paper, Button } from '@material-ui/core';
import AuthFormInput from '../common/AuthFormInput';
import PasswordInput from '../common/PasswordInput';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { compose } from 'recompose';
import { registerUser } from '../../store/auth';
import routes from '../../constants/routes'
const styles = () => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 40px',
    maxWidth: '300px'
  },
  textCenter: {
    textAlign: 'center'
  }
});

const RegistrationForm = ({ classes, dispatch, history }) => {
  const [values, setValues] = useState({
    username: '',
    password: '',
    repeatPassword: '',
    firstname: '',
    lastname: '',
    patronicname: ''
  });
  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };
  const handleSubmit = event => {
    event.preventDefault();
    const { username, password, firstname, lastname, patronicname } = values;
    dispatch(
      registerUser({ username, password, firstname, lastname, patronicname })
    )
      .then(() => history.push(routes.home))
      .catch(console.error);
  };
  return (
    <>
      <Paper className={classes.form} component="form" onSubmit={handleSubmit}>
        <AuthFormInput
          id="username"
          handleChange={handleChange('username')}
          value={values.username}
          label="Username"
          required
        />
        <AuthFormInput
          id="lastname"
          handleChange={handleChange('lastname')}
          value={values.lastname}
          label="Last name"
        />
        <AuthFormInput
          id="firstname"
          handleChange={handleChange('firstname')}
          value={values.firstname}
          label="First name"
        />
        <AuthFormInput
          id="patronicname"
          handleChange={handleChange('patronicname')}
          value={values.patronicname}
          label="Middle name"
        />
        <PasswordInput
          id="password"
          handleChange={handleChange('password')}
          value={values.password}
          label="Password"
        />
        <PasswordInput
          id="repeatPassword"
          handleChange={handleChange('repeatPassword')}
          value={values.repeatPassword}
          label="Repeat password"
        />
        <Button color="primary" variant="contained" type="submit">
          Sign up
        </Button>
      </Paper>
      <Typography className={classNames(classes.textCenter, classes.form)}>
        Already signed up? <Link to={routes.home}>Sign in</Link>
      </Typography>
    </>
  );
};

export default compose(
  withStyles(styles),
  connect(),
  withRouter
)(RegistrationForm);
