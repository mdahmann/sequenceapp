import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    primary: {
      50: '#FAF9F6',  // Off-White
      100: '#EAEAEA', // Soft Gray
      900: '#232323', // Charcoal Black
    },
    accent: {
      green: '#A8BDA8', // Muted Sage
      beige: '#E0C9A6', // Sand Beige
      purple: '#9C8ADE', // Iridescent Lavender
      peach: '#FFAB8A', // Muted Peach
      blue: '#78E0DC',  // Aqua Blue
    },
  },
  fonts: {
    heading: 'var(--font-inter)',
    body: 'var(--font-inter)',
  },
  styles: {
    global: {
      body: {
        bg: 'primary.50',
        color: 'primary.900',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'lg',
      },
      variants: {
        solid: {
          bg: 'accent.green',
          color: 'white',
          _hover: {
            bg: 'accent.purple',
          },
        },
        outline: {
          borderColor: 'accent.green',
          color: 'accent.green',
          _hover: {
            bg: 'accent.green',
            color: 'white',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'primary.900',
        fontWeight: 'bold',
        letterSpacing: '-0.02em',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'xl',
          boxShadow: 'sm',
        },
      },
    },
  },
})

export default theme 