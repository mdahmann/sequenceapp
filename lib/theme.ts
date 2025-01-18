import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
      },
    },
  },
  colors: {
    gray: {
      900: '#111827',
      800: '#1F2937',
      700: '#374151',
      600: '#4B5563',
      500: '#6B7280',
      400: '#9CA3AF',
      300: '#D1D5DB',
      200: '#E5E7EB',
      100: '#F3F4F6',
      50: '#F9FAFB',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'blue.500',
      },
      variants: {
        filled: {
          field: {
            bg: 'whiteAlpha.50',
            _hover: {
              bg: 'whiteAlpha.100',
            },
            _focus: {
              bg: 'whiteAlpha.100',
            },
          },
        },
      },
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
})

export default theme 