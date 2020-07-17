const options = {
  bottom: '32px', // default: '64px'
  right: '32px', // default: 'unset'
  left: 'unset', // default: '32px'
  time: '0.3s', // default: '0.3s'
  mixColor: '#dadcd6', // default: '#fff'
  backgroundColor: '#fff',  // default: '#fff'
  buttonColorDark: '#100f2c',  // default: '#100f2c'
  buttonColorLight: '#fff', // default: '#fff'
  saveInCookies: true, // default: true,
  label: '🌓', // default: ''
  autoMatchOsTheme: true // default: true
}

const darkmode = new Darkmode(options);

darkmode.showWidget();