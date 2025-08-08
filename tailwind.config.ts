import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			'subtle': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
  			'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  			'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  			'glow': '0 0 15px rgba(var(--primary-rgb), 0.5)',
  			'glow-blue': '0 0 15px rgba(59, 130, 246, 0.5)',
  			'glow-green': '0 0 15px rgba(16, 185, 129, 0.5)',
  			'glow-red': '0 0 15px rgba(239, 68, 68, 0.5)',
  			'glow-purple': '0 0 15px rgba(139, 92, 246, 0.5)',
  			'inner-glow': 'inset 0 0 15px 0px rgba(var(--primary-rgb), 0.2)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
        'fade-in-bottom': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'header-shrink': {
          '0%': {
            height: '80px'
          },
          '100%': {
            height: '60px'
          },
        },
        'slide-in': {
          '0%': {
            transform: 'translateX(-20px)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1' 
          }
        },
        'background-shine': {
          'from': {
            backgroundPosition: '200% 0'
          },
          'to': {
            backgroundPosition: '-200% 0'
          }
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0)'
          },
          '50%': {
            transform: 'translateY(-5px)'
          }
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px 0px rgba(var(--primary-rgb), 0.2)' },
          '50%': { boxShadow: '0 0 15px 5px rgba(var(--primary-rgb), 0.4)' },
        },
        'fadeIn': { /* Renomeado de fade-in para evitar conflito com nome de classe */
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slideInFromBottom': { /* Renomeado de fade-in-bottom para melhor clareza */
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-bottom': 'fade-in-bottom 0.5s ease-out forwards', /* Mantido por retrocompatibilidade se usado em outro lugar */
        'fadeIn': 'fadeIn 0.5s ease-in-out forwards', /* Nova animação de fade puro */
        'slideInFromBottom': 'slideInFromBottom 0.5s ease-out forwards', /* Nova animação de slide + fade */
        'header-shrink': 'header-shrink 0.3s ease-out forwards',
        'slide-in': 'slide-in 0.4s ease-out forwards',
        'background-shine': 'background-shine 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'stagger-1': 'slideInFromBottom 0.5s ease-out 0.1s forwards',
        'stagger-2': 'slideInFromBottom 0.5s ease-out 0.2s forwards',
        'stagger-3': 'slideInFromBottom 0.5s ease-out 0.3s forwards',
        'stagger-4': 'slideInFromBottom 0.5s ease-out 0.4s forwards',
        'stagger-5': 'slideInFromBottom 0.5s ease-out 0.5s forwards',
        'stagger-6': 'slideInFromBottom 0.5s ease-out 0.6s forwards',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  		},
      animationDelay: { // Classes utilitárias para animation-delay
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
      },
      transitionDelay: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
      },
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'shimmer': 'linear-gradient(110deg, transparent, rgba(var(--primary-rgb), 0.2), transparent)',
  			'neon-glow': 'linear-gradient(var(--tw-gradient-stops))',
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar")({ nocompatible: true }),
    plugin(function({ addUtilities }) {
      addUtilities({
        '.shadow-inner-top': {
          'box-shadow': 'inset 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        },
        '.header-scroll-effect': {
          '@apply sticky top-0 z-50 transition-all duration-300': {}
        },
        '.glass-effect': {
          '@apply bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10': {}
        },
        '.card-hover': {
          '@apply transition-all duration-300 hover:shadow-lg hover:-translate-y-1': {}
        },
        '.text-balance': {
          'text-wrap': 'balance'
        },
        '.backdrop-blur-2xl': {
          'backdrop-filter': 'blur(40px)'
        },
        '.header-action-button': {
          '@apply transition-colors bg-muted/20 hover:bg-muted/50': {}
        },
        '.shimmer': {
          'position': 'relative',
          'overflow': 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'linear-gradient(110deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            'animation': 'shimmer 2s linear infinite',
          }
        },
      })
    })
  ]
} satisfies Config

export default config