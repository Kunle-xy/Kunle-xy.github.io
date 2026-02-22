// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "publications by categories in reversed chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-news",
          title: "news",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/news/";
          },
        },{id: "nav-teaching",
          title: "teaching",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/teaching/";
          },
        },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-aws-certified-machine-learning-specialty",
          title: 'AWS Certified Machine Learning - Specialty',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_aws_certification/";
            },},{id: "news-presented-at-asce-ictd-pavement-2025-conference",
          title: 'Presented at ASCE ICTD-Pavement 2025 Conference',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_ictd_conference/";
            },},{id: "news-second-runner-up-at-isu-ccee-graduate-student-poster-competition",
          title: 'Second Runner-Up at ISU CCEE Graduate Student Poster Competition',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_poster_competition/";
            },},{id: "news-paper-published-maintenance-record-enriched-ml-model-for-pavement-iri-prediction",
          title: 'Paper Published: Maintenance Record-Enriched ML Model for Pavement IRI Prediction',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_pavement_iri_paper/";
            },},{id: "news-first-time-presenter-at-trb-2026-annual-meeting",
          title: 'First-Time Presenter at TRB 2026 Annual Meeting',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_trb_2026/";
            },},{id: "news-received-the-gpss-research-excellence-award",
          title: 'Received the GPSS Research Excellence Award',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_gpss_award/";
            },},{id: "projects-underground-utility-mapping",
          title: 'Underground Utility Mapping',
          description: "AI-Powered Probabilistic Framework for Automated Subsurface Infrastructure Detection Using Fuzzy Logic and Computer Vision",
          section: "Projects",handler: () => {
              window.location.href = "/projects/10_project/";
            },},{id: "projects-a-algorithm-8-puzzle-solver",
          title: 'A* Algorithm - 8-Puzzle Solver',
          description: "Intelligent pathfinding with admissible heuristics",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_project/";
            },},{id: "projects-monte-carlo-tree-search-checkers-ai",
          title: 'Monte Carlo Tree Search - Checkers AI',
          description: "Intelligent game-playing through adaptive simulation",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_project/";
            },},{id: "projects-hidden-markov-model-market-regime-trading",
          title: 'Hidden Markov Model - Market Regime Trading',
          description: "Decoding financial markets with probabilistic state machines",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project/";
            },},{id: "projects-kalman-filter-applications-in-finance",
          title: 'Kalman Filter Applications in Finance',
          description: "State-space modeling for financial forecasting",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_project/";
            },},{id: "projects-causal-inference-a-case-study-of-uber-and-amazon",
          title: 'Causal Inference: A Case Study of Uber and Amazon',
          description: "Analyzing causal relationships in tech company operations",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_project/";
            },},{id: "projects-gravelroad-management-software",
          title: 'GravelRoad Management Software',
          description: "Full-stack web application for automated rut detection and infrastructure monitoring using GeoTIFF analysis",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_project/";
            },},{id: "projects-handling-messy-iowa-paved-road-big-data",
          title: 'Handling Messy Iowa Paved Road Big Data',
          description: "Data quality control and segmentation for infrastructure datasets",
          section: "Projects",handler: () => {
              window.location.href = "/projects/7_project/";
            },},{id: "projects-personaai-digital-avatar-with-rag",
          title: 'PersonaAI - Digital Avatar with RAG',
          description: "Personalized AI assistant that mimics individual personality using Retrieval-Augmented Generation and Llama 2 70B",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_project/";
            },},{id: "projects-agriculture-monitoring-database",
          title: 'Agriculture Monitoring Database',
          description: "Data management system for agricultural infrastructure monitoring",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project/";
            },},{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/assets/pdf/Kunle%20oguntoye.pdf", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6F%67%75%6E%74%6F%79%65@%69%61%73%74%61%74%65.%65%64%75", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/Kunle-xy", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/kunleoguntoye", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=w1JdW5UAAAAJ", "_blank");
        },
      },{
        id: 'social-x',
        title: 'X',
        section: 'Socials',
        handler: () => {
          window.open("https://twitter.com/kizzy_waynie", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
