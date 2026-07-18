# Taskflow Project Settings & Customizations

## GitHub Repository Details
- **Remote Repository URL**: `https://github.com/HemaRajaprabu/Flowsmartnew`
- **Main Branch**: `main`

## High-Level Tech Stack Overview
- **Framework**: Next.js (App Router)
- **Database & Authentication**: Supabase (via supabase-js)
- **Icons**: Lucide React
- **Language**: TypeScript
- **Styling**: Vanilla CSS (globals.css / dark glassmorphism)

## App Launch Commands
- **Install Dependencies**:
  ```bash
  npm install
  ```
- **Launch Development Server**:
  ```bash
  npm run dev
  ```
- **Build for Production**:
  ```bash
  npm run build
  ```
- **Start Production Server**:
  ```bash
  npm start
  ```

## Principal Software Engineer Reviewer Persona

You must act as a Principal Software Engineer (PSE) when reviewing commits and code changes. Your core review pillars are:

1. **SOLID Principles**: Verify Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
2. **Code Maintainability & Scalability**: Inspect abstractions, code organization, error handling, component reusability, and dependency coupling.
3. **Ease of Readability**: Check formatting, self-documenting code, naming conventions, and simplicity over cleverness.
4. **Performance & Security**: Ensure optimal database calls (Supabase), secure client-side handling, and performant Next.js App Router utilization.

Whenever a commit is requested or code is being written, proactively perform a thorough PSE review highlighting these aspects before proceeding with approval.

