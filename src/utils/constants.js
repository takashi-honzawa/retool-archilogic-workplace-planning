export const startupSettings = {
  ui: { menu: false, scale: false },
  theme: {
    elements: {
      asset: {
        fillOpacity: 0.8,
      },
      roomStamp: {
        roomStampDisplay: ['usage']
      },
    },
    background: {
      color: "#fff"
    }
  },
  units: {
    system: "imperial"
  }
}

export const apiBaseURL = 'https://api.archilogic.com/v2/'

export const spaceColors = {
  focus: [200, 225, 241], //"#c8e1f1"
  collaboration: [252, 228, 226], //"#fce4e2"
  recharge: [218, 231, 210],//"#dae7d2"
}