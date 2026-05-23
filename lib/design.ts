export const DESIGN = {
  // Border radius
  radius: {
    sm: 8,      // small elements — badges, chips, tags
    md: 12,     // inputs, small cards
    lg: 16,     // standard cards
    xl: 20,     // large feature cards
    full: 9999, // pills, avatars, circular buttons
  },

  // Shadows — use these for all cards
  shadow: {
    // Light theme shadows
    light: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      },
    },
    // Dark/Kryd theme shadows — use colour tint not black
    dark: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  },

  // Spacing
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  // Card padding — consistent inside all cards
  cardPadding: {
    sm: 12,   // compact cards — stat rows, mini cards
    md: 16,   // standard cards — job cards, course cards
    lg: 20,   // feature cards — hero cards, profile card
  },
};

export const avatarColours = ['#1D9E75', '#185FA5', '#854F0B', '#534AB7', '#A32D2D', '#0B5C3A'];

export function getAvatarColour(name: string): string {
  if (!name) return avatarColours[0];
  return avatarColours[name.charCodeAt(0) % avatarColours.length];
}
