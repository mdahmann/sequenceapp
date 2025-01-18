# Araoke for Embodiment

A modern, AI-powered app for yoga, dance, and breathwork instructors to create and deliver personalized class sequences.

## Features

- **Profile Creation**: Create personalized teaching profiles with AI-powered style analysis
- **Music Integration**: Seamless Spotify integration for class playlists
- **Pose Library**: Comprehensive stick-figure pose library for sequence creation
- **Sequence Generation**: AI-generated class sequences with Overview and Karaoke modes
- **Machine Learning**: Continuous improvement through usage patterns

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL
- **AI Integration**: OpenAI API
- **Storage**: AWS S3
- **Authentication**: NextAuth.js
- **Music**: Spotify API
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_API_URL=
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # Reusable UI components
├── lib/                 # Utility functions and shared logic
├── types/              # TypeScript type definitions
├── styles/             # Global styles and Tailwind config
└── features/           # Feature-specific components and logic
    ├── auth/           # Authentication related components
    ├── profile/        # Profile management
    ├── sequences/      # Sequence creation and management
    ├── poses/          # Pose library
    └── music/          # Music integration
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT 