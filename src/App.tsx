/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { TestBuilder } from './components/TestBuilder';
import { ParticipantQuiz } from './components/ParticipantQuiz';
import { CreatorDashboard } from './components/CreatorDashboard';
import { MyQuizzes } from './components/MyQuizzes';
import { clientStorage } from './utils/storageClient';

type ViewMode = 'landing' | 'create' | 'quiz' | 'dashboard' | 'my-quizzes';

export default function App() {
  const [view, setView] = useState<ViewMode>('landing');
  const [activeShortId, setActiveShortId] = useState<string>('maya77');
  const [myQuizzesCount, setMyQuizzesCount] = useState<number>(0);

  // Parse path on initial load or popstate
  const parseRoute = () => {
    const pathname = window.location.pathname;

    // Check for /q/:shortId
    const quizMatch = pathname.match(/^\/q\/([a-zA-Z0-9_-]+)/);
    if (quizMatch) {
      setActiveShortId(quizMatch[1]);
      setView('quiz');
      return;
    }

    // Check for /dashboard/:shortId
    const dashMatch = pathname.match(/^\/dashboard\/([a-zA-Z0-9_-]+)/);
    if (dashMatch) {
      setActiveShortId(dashMatch[1]);
      setView('dashboard');
      return;
    }

    if (pathname === '/create') {
      setView('create');
      return;
    }

    if (pathname === '/my-quizzes') {
      setView('my-quizzes');
      return;
    }

    if (pathname === '/demo') {
      setActiveShortId('maya77');
      setView('quiz');
      return;
    }

    setView('landing');
  };

  useEffect(() => {
    parseRoute();
    setMyQuizzesCount(clientStorage.getCreatorTokens().length);

    const handlePopState = () => {
      parseRoute();
      setMyQuizzesCount(clientStorage.getCreatorTokens().length);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newView: string, param?: string) => {
    let targetPath = '/';

    if (newView === 'create') {
      targetPath = '/create';
      setView('create');
    } else if (newView === 'quiz' && param) {
      targetPath = `/q/${param}`;
      setActiveShortId(param);
      setView('quiz');
    } else if (newView === 'demo') {
      targetPath = '/q/maya77';
      setActiveShortId('maya77');
      setView('quiz');
    } else if (newView === 'dashboard' && param) {
      targetPath = `/dashboard/${param}`;
      setActiveShortId(param);
      setView('dashboard');
    } else if (newView === 'my-quizzes') {
      targetPath = '/my-quizzes';
      setView('my-quizzes');
    } else {
      targetPath = '/';
      setView('landing');
    }

    window.history.pushState({}, '', targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMyQuizzesCount(clientStorage.getCreatorTokens().length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] text-stone-900 selection:bg-orange-500/20 selection:text-orange-950 font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar
        currentView={view}
        onNavigate={navigate}
        myQuizzesCount={myQuizzesCount}
      />

      <main className="flex-1">
        {view === 'landing' && (
          <LandingPage
            onCreateTest={() => navigate('create')}
            onTryDemo={() => navigate('demo')}
          />
        )}

        {view === 'create' && (
          <TestBuilder
            onPublishSuccess={shortId => {
              setMyQuizzesCount(clientStorage.getCreatorTokens().length);
            }}
            onNavigateToQuiz={shortId => navigate('quiz', shortId)}
            onNavigateToDashboard={shortId => navigate('dashboard', shortId)}
          />
        )}

        {view === 'quiz' && (
          <ParticipantQuiz
            shortId={activeShortId}
            onNavigateHome={() => navigate('landing')}
            onCreateNewQuiz={() => navigate('create')}
          />
        )}

        {view === 'dashboard' && (
          <CreatorDashboard
            shortId={activeShortId}
            onNavigateHome={() => navigate('landing')}
            onNavigateToQuiz={shortId => navigate('quiz', shortId)}
          />
        )}

        {view === 'my-quizzes' && (
          <MyQuizzes
            onNavigateToDashboard={shortId => navigate('dashboard', shortId)}
            onNavigateToQuiz={shortId => navigate('quiz', shortId)}
            onCreateNewQuiz={() => navigate('create')}
            onTryDemo={() => navigate('demo')}
          />
        )}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}
