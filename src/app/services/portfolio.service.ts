import { Injectable } from '@angular/core';
import { PortfolioData, WorkExperience, PortfolioItem, SocialLink, Education } from '../models/portfolio.model';

export type PortfolioType = 'developer' | 'qa';

export interface ProfileIdentifier {
  name: string;
  type: PortfolioType;
  key: string; // e.g., 'sujit-developer', 'mona-qa'
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private currentType: PortfolioType = 'developer';
  private currentProfileKey: string = 'sujit-developer';
  private readonly STORAGE_KEY = 'portfolio_profile_data';
  private readonly STORAGE_PROFILE_KEY = 'portfolio_active_profile';

  // Profile registry - maps profile keys to their data
  private profileRegistry: Map<string, PortfolioData> = new Map();

  constructor() {
    this.initializeProfiles();
  }

  private initializeProfiles(): void {
    // Register developer profile
    this.profileRegistry.set('sujit-developer', this.developerPortfolioData);
    // Register QA profile
    this.profileRegistry.set('mona-qa', this.qaPortfolioData);
  }

  // Get all available profiles
  getAvailableProfiles(): ProfileIdentifier[] {
    return [
      { name: 'sujit', type: 'developer', key: 'sujit-developer' },
      { name: 'mona', type: 'qa', key: 'mona-qa' }
    ];
  }

  // Check if a profile exists
  hasProfile(profileKey: string): boolean {
    return this.profileRegistry.has(profileKey);
  }

  // Get profile by key
  getProfileByKey(profileKey: string): PortfolioData | null {
    return this.profileRegistry.get(profileKey) || null;
  }

  // Set active profile and store in localStorage
  setActiveProfile(profileKey: string, portfolioData?: PortfolioData): void {
    this.currentProfileKey = profileKey;
    const data = portfolioData || this.profileRegistry.get(profileKey);
    
    if (data) {
      // Extract type from profile key
      const type = profileKey.includes('-qa') ? 'qa' : 'developer';
      this.currentType = type;
      
      // Store in localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(this.STORAGE_PROFILE_KEY, profileKey);
      }
    }
  }

  // Get active profile key
  getActiveProfileKey(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_PROFILE_KEY);
      if (stored) {
        return stored;
      }
    }
    return this.currentProfileKey;
  }

  // Get portfolio data from storage or registry
  getPortfolioDataFromStorage(): PortfolioData | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing stored portfolio data:', e);
        }
      }
    }
    return null;
  }

  // Clear all portfolio data from localStorage
  clearStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STORAGE_PROFILE_KEY);
      // Reset to default
      this.currentProfileKey = 'sujit-developer';
      this.currentType = 'developer';
    }
  }

  setPortfolioType(type: PortfolioType): void {
    this.currentType = type;
  }

  getCurrentPortfolioType(): PortfolioType {
    return this.currentType;
  }

  private developerPortfolioData: PortfolioData = {
    name: 'Sujit Kumar Patra',
    title: 'Senior Software Engineer',
    bio: 'Experienced software engineer with a passion for building scalable, efficient, and user-friendly applications. Specializing in modern web technologies, I bring creativity and technical expertise to deliver high-quality software solutions.',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    workExperience: [
      {
        id: 1,
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior Software Engineer',
        startDate: '2022-08',
        endDate: undefined, // Current position
        responsibilities: [
          'Analyze client requirements and user stories to design and implement scalable backend APIs using NestJS and Express.js',
          'Design database schemas, create migrations, and optimize database performance for enterprise applications',
          'Collaborate with cross-functional teams including QA, front-end developers, and project managers to ensure seamless integration and delivery',
          'Develop full-stack solutions including workflow automation, mentoring portals, and real-time communication platforms',
          'Debug, optimize, and maintain APIs for high performance, reliability, and scalability'
        ],
        technologies: ['Node.js', 'NestJS', 'Express.js', 'PostgreSQL', 'MySQL', 'TypeORM', 'Sequelize', 'TypeScript', 'ReactJS', 'Kafka']
      },
      {
        id: 2,
        company: 'The Bootcamp Consultancy Private Limited',
        role: 'Application Developer',
        startDate: '2020-04',
        endDate: '2022-07',
        responsibilities: [
          'Developed RESTful APIs and backend services for various client applications',
          'Implemented data import scenarios and database management solutions using SQL stored procedures',
          'Created notification systems and integrated third-party services for customer management applications',
          'Worked on data formatting, migration, and reporting solutions using PowerBI'
        ],
        technologies: ['Node.js', 'Express.js', 'MSSQL', 'PowerBI', 'JavaScript']
      }
    ],
    education: [
      {
        id: 1,
        degree: 'Graduation',
        institution: 'Governement College of Engineering, Keonjhar',
        year: '2019',
        percentage: '75%',
        icon: '🎓'
      },
      {
        id: 2,
        degree: '12th',
        institution: 'Ispat Vidya Mandir, Sector-19, Rourkela',
        year: '2015',
        percentage: '80%',
        icon: '📚'
      },
      {
        id: 3,
        degree: '10th',
        institution: 'Saraswati Shishu Vidya Mandir, Sector-6, Rourkela',
        year: '2013',
        percentage: '85%',
        icon: '📖'
      }
    ],
    portfolio: [
      {
        id: 1,
        title: 'Eureka Hub & Viewer - Q3',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior Software Engineer',
        category: 'Backend Development',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=500&fit=crop',
        description: 'Eureka Hub is Caresoft\'s internal ideation tool. The current project focuses on enhancing the platform with new features based on client-defined user stories. We are working on the third phase of the ongoing development of the Eureka Viewer & Hub application. This phase continues to build upon the previous releases and includes user stories centered around improving system integration, refining the user interface, and introducing additional functional capabilities to meet evolving business requirements.',
        startDate: '2025-06',
        endDate: undefined,
        technologies: ['Node.js', 'PostgreSQL', 'NestJS', 'TypeORM'],
        responsibilities: [
          'Analyse client-defined user stories to extract detailed functional requirements and define clear acceptance criteria',
          'Collaborate effectively with cross-functional teams including QA engineers, front-end developers, UX designers, and project managers to ensure end-to-end integration and timely delivery',
          'Adhere to coding standards, best practices, and contribute to code reviews and technical documentation'
        ]
      },
      {
        id: 2,
        title: 'Eureka HUB',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior Software Engineer',
        category: 'Backend Development',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=500&fit=crop',
        description: 'Eureka Hub is Caresoft\'s internal ideation tool, and the current project focuses on enhancing it with new features based on client-defined user stories. The updates include a User Management module, an Approval module for master data changes, workflow enhancements, and a linkage feature to connect related items, all aimed at improving usability, governance, and collaboration.',
        startDate: '2025-02',
        endDate: '2025-07',
        technologies: ['NestJS', 'Node.js', 'PostgreSQL', 'TypeORM'],
        responsibilities: [
          'Analyse user stories to extract detailed requirements and acceptance criteria',
          'Design and implement efficient, scalable, and maintainable APIs that align with project goals',
          'Collaborate closely with cross-functional teams including QA, front-end developers, and project managers to ensure seamless integration and delivery',
          'Identify, debug, and resolve issues encountered during development, integration, and testing phases',
          'Continuously optimize APIs for high performance, reliability, and scalability under varying workloads'
        ]
      },
      {
        id: 3,
        title: 'Enhancements of Eureka Application',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior Software Engineer',
        category: 'Backend Development',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=500&fit=crop',
        description: 'This project focuses on enhancing Eureka applications for Caresoft to streamline workflows and improve usability. The applications will enable users to upload PDFs, extract relevant data, and efficiently manage opportunities by creating, viewing, and approving them. Additionally, they will support converting opportunities into actionable ideas, ensuring a seamless transition between stages. These enhancements aim to optimize processes, improve data handling, and provide a more user-friendly experience within the Eureka platform.',
        startDate: '2024-10',
        endDate: '2025-01',
        technologies: ['NestJS', 'Node.js', 'PostgreSQL', 'TypeORM'],
        responsibilities: [
          'Analyse the requirements and acceptance criteria outlined in the user stories',
          'Focus on designing and implementing efficient and scalable APIs to meet the project requirements',
          'Work closely with team members, including QA, front-end developers, and project managers, to ensure smooth implementation',
          'Debug and resolve any issues arising during development and testing',
          'Optimise APIs for performance and scalability'
        ]
      },
      {
        id: 4,
        title: 'Freshers Mentoring Portal',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior Software Engineer',
        category: 'Full Stack',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=500&fit=crop',
        description: 'This project aims to streamline and enhance the mentoring process for freshers by assigning dedicated mentors, enabling the review of their progress, details, and feedback. It provides management with a comprehensive overview of the entire training cycle, facilitating effective tracking, assessment, and decision-making to ensure the success and development of freshers throughout their on boarding journey.',
        startDate: '2022-08',
        endDate: '2024-08',
        technologies: ['Express.js', 'MySQL', 'Node.js', 'Sequelize'],
        responsibilities: [
          'Analyse project requirements to design database schemas and relationships effectively',
          'Create and execute database migrations to set up and manage tables as per the project needs',
          'Develop APIs based on the defined requirements to support various functionalities of the project',
          'Design and integrate a notification module for the portal'
        ]
      },
      {
        id: 5,
        title: 'Business Workflow Builder',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior Software Engineer',
        category: 'Full Stack',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop',
        description: 'The scope of this project is to be experimented with within QBurst for Business and HR workflow automation. Workflow automation tools are particularly useful for HR and management users, addressing ad hoc requirements that do not warrant involving the Space team for implementation within the Space app.',
        startDate: '2023-10',
        endDate: '2024-02',
        technologies: ['Express.js', 'Node.js', 'PostgreSQL', 'ReactJS', 'Sequelize'],
        responsibilities: [
          'Designed and implemented database table migrations based on project requirements',
          'Built a module to facilitate dynamic table creation based on runtime requirements',
          'Implemented dynamic property updates for components, enhancing UI flexibility',
          'Followed best practices for writing clean, maintainable code'
        ]
      },
      {
        id: 6,
        title: 'Recruitment App',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior Software Engineer',
        category: 'Backend Development',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=500&fit=crop',
        description: 'The scope of this project is to handle the recruitment. The application should allow to configure the workflow specific to each recruiter and based on the workflow the candidate profiles should go through various stages of the selection process.',
        startDate: '2023-08',
        endDate: '2023-10',
        technologies: ['PostgreSQL', 'Tooljet'],
        responsibilities: [
          'Created workflows based on the design',
          'Configured workflows and fetched the required data from db'
        ]
      },
      {
        id: 7,
        title: 'Zeal',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior Software Engineer',
        category: 'Backend Development',
        imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=500&fit=crop',
        description: 'The scope of this project is to enable users to communicate and collaborate with their teams in real-time.',
        startDate: '2023-04',
        endDate: '2023-09',
        technologies: ['Express.js', 'Node.js', 'Sequelize', 'TypeScript', 'Kafka'],
        responsibilities: [
          'Added Kafka for communicating between the services',
          'Worked on sending out invitation links to the users to join the workspace',
          'Created multiple events like joining workspace, view channel details, edit channels etc.'
        ]
      },
      {
        id: 8,
        title: 'Other Projects',
        company: 'The Bootcamp Consultancy Private Limited',
        role: 'Application Developer',
        category: 'Full Stack',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=500&fit=crop',
        description: 'Worked on multiple projects involving data import, database management, and API development.',
        startDate: '2020-01',
        endDate: '2022-07',
        technologies: ['Express.js', 'MSSQL', 'Node.js', 'PowerBI'],
        responsibilities: [
          'Created import scenarios and got the data from the client-server inserted to SQL database',
          'Formatted the data according to the requirement using SQL stored procedure',
          'Created APIs for the application to add customers, assign a room, and send out notifications to the staff based on customer requirement'
        ]
      }
    ],
    socialLinks: [
      {
        name: 'LinkedIn',
        url: 'https://linkedin.com',
        icon: '💼'
      },
      {
        name: 'GitHub',
        url: 'https://github.com',
        icon: '🐙'
      },
      {
        name: 'Twitter',
        url: 'https://twitter.com',
        icon: '🐦'
      }
    ],
    contact: {
      email: 'sujit.patra@example.com',
      phone: '+91 9876543210',
      address: 'Available for remote work worldwide'
    }
  };

  private qaPortfolioData: PortfolioData = {
    name: 'Monalisha Biswal',
    title: 'Senior QA Engineer',
    bio: 'Experienced Quality Assurance Engineer with a passion for ensuring software quality, testing excellence, and delivering bug-free applications. Specializing in test automation, manual testing, and quality processes, I bring meticulous attention to detail and technical expertise to deliver high-quality software solutions.',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    workExperience: [
      {
        id: 1,
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior QA Engineer',
        startDate: '2022-08',
        endDate: undefined,
        responsibilities: [
          'Design and execute comprehensive test plans, test cases, and test scenarios for web and mobile applications',
          'Perform manual testing including functional, regression, integration, and user acceptance testing',
          'Develop and maintain automated test scripts using Selenium, Cypress, and other testing frameworks',
          'Collaborate with cross-functional teams including developers, product managers, and stakeholders to ensure quality delivery',
          'Identify, document, and track bugs using JIRA and other bug tracking tools',
          'Participate in Agile/Scrum ceremonies including sprint planning, daily standups, and retrospectives',
          'Perform API testing using Postman and REST Assured',
          'Conduct performance and load testing to ensure application scalability'
        ],
        technologies: ['Selenium', 'Cypress', 'Postman', 'JIRA', 'TestNG', 'JUnit', 'REST Assured', 'Jenkins', 'Git']
      },
      {
        id: 2,
        company: 'The Bootcamp Consultancy Private Limited',
        role: 'QA Engineer',
        startDate: '2020-04',
        endDate: '2022-07',
        responsibilities: [
          'Executed manual testing for various client applications and web services',
          'Created and maintained test documentation including test plans, test cases, and bug reports',
          'Performed regression testing to ensure existing functionality remained intact after new releases',
          'Collaborated with development teams to reproduce and verify bug fixes',
          'Participated in requirement analysis and test case review sessions'
        ],
        technologies: ['Manual Testing', 'JIRA', 'TestRail', 'Postman', 'SQL']
      }
    ],
    education: [
      {
        id: 1,
        degree: 'Graduation',
        institution: 'Governement College of Engineering, Keonjhar',
        year: '2019',
        percentage: '75%',
        icon: '🎓'
      },
      {
        id: 2,
        degree: '12th',
        institution: 'Ispat Vidya Mandir, Sector-19, Rourkela',
        year: '2015',
        percentage: '80%',
        icon: '📚'
      },
      {
        id: 3,
        degree: '10th',
        institution: 'Saraswati Shishu Vidya Mandir, Sector-6, Rourkela',
        year: '2013',
        percentage: '85%',
        icon: '📖'
      }
    ],
    portfolio: [
      {
        id: 1,
        title: 'Eureka Hub & Viewer - Q3 Testing',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior QA Engineer',
        category: 'Test Automation',
        imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=500&fit=crop',
        description: 'Comprehensive testing of Eureka Hub ideation platform focusing on new features, workflow enhancements, and system integration. This phase includes testing user management modules, approval workflows, and linkage features to ensure seamless functionality and user experience.',
        startDate: '2025-06',
        endDate: undefined,
        technologies: ['Cypress', 'Postman', 'JIRA', 'Manual Testing'],
        responsibilities: [
          'Design and execute test cases for new user stories and features',
          'Perform regression testing to ensure existing functionality remains intact',
          'Develop and maintain automated test scripts for critical user flows',
          'Collaborate with developers and product managers to clarify requirements and acceptance criteria',
          'Identify, document, and track defects through the entire bug lifecycle'
        ]
      },
      {
        id: 2,
        title: 'Eureka HUB Quality Assurance',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior QA Engineer',
        category: 'Quality Assurance',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop',
        description: 'End-to-end testing of Eureka Hub platform including User Management module, Approval workflows, and master data governance features. Ensured high-quality delivery through comprehensive test coverage and thorough validation of all functionalities.',
        startDate: '2025-02',
        endDate: '2025-07',
        technologies: ['Selenium', 'TestNG', 'Postman', 'JIRA'],
        responsibilities: [
          'Created comprehensive test plans and test cases for all modules',
          'Performed functional, integration, and regression testing',
          'Developed automated test suites for critical business workflows',
          'Conducted API testing to validate backend functionality',
          'Performed cross-browser and compatibility testing'
        ]
      },
      {
        id: 3,
        title: 'Eureka Application Enhancements Testing',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior QA Engineer',
        category: 'Manual Testing',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop',
        description: 'Testing enhancements for Eureka applications including PDF upload functionality, data extraction features, and opportunity management workflows. Ensured seamless user experience and data integrity throughout the application lifecycle.',
        startDate: '2024-10',
        endDate: '2025-01',
        technologies: ['Manual Testing', 'Postman', 'JIRA', 'SQL'],
        responsibilities: [
          'Tested PDF upload and data extraction functionalities',
          'Validated opportunity creation, viewing, and approval workflows',
          'Performed data integrity and validation testing',
          'Created detailed test reports and defect documentation',
          'Participated in user acceptance testing with stakeholders'
        ]
      },
      {
        id: 4,
        title: 'Freshers Mentoring Portal QA',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior QA Engineer',
        category: 'Full Stack Testing',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=500&fit=crop',
        description: 'Comprehensive quality assurance for the Freshers Mentoring Portal, ensuring seamless mentor assignment, progress tracking, and feedback management. Validated end-to-end workflows and user interactions across all modules.',
        startDate: '2022-08',
        endDate: '2024-08',
        technologies: ['Selenium', 'Postman', 'JIRA', 'Manual Testing'],
        responsibilities: [
          'Designed and executed test scenarios for mentor-mentee workflows',
          'Tested progress tracking and reporting functionalities',
          'Validated notification system and communication features',
          'Performed database validation and data consistency checks',
          'Ensured responsive design and cross-device compatibility'
        ]
      },
      {
        id: 5,
        title: 'Business Workflow Builder Testing',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior QA Engineer',
        category: 'Test Automation',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop',
        description: 'Quality assurance for Business Workflow Builder focusing on dynamic workflow creation, table management, and property configuration. Ensured robust testing of dynamic features and flexible UI components.',
        startDate: '2023-10',
        endDate: '2024-02',
        technologies: ['Cypress', 'Postman', 'JIRA', 'Manual Testing'],
        responsibilities: [
          'Tested dynamic workflow creation and configuration',
          'Validated dynamic table creation and property updates',
          'Performed end-to-end testing of workflow execution',
          'Developed automated tests for critical workflow scenarios',
          'Ensured data persistence and workflow state management'
        ]
      },
      {
        id: 6,
        title: 'Recruitment App Quality Assurance',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior QA Engineer',
        category: 'Manual Testing',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=500&fit=crop',
        description: 'Comprehensive testing of Recruitment App including workflow configuration, candidate profile management, and multi-stage selection process. Ensured accurate workflow execution and candidate progression tracking.',
        startDate: '2023-08',
        endDate: '2023-10',
        technologies: ['Manual Testing', 'Postman', 'JIRA'],
        responsibilities: [
          'Tested recruiter-specific workflow configurations',
          'Validated candidate profile progression through selection stages',
          'Performed data validation and workflow state testing',
          'Created test documentation and defect reports',
          'Participated in requirement clarification sessions'
        ]
      },
      {
        id: 7,
        title: 'Zeal Communication Platform QA',
        company: 'Qburst Technologies Pvt Ltd',
        role: 'Senior QA Engineer',
        category: 'Real-time Testing',
        imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=500&fit=crop',
        description: 'Quality assurance for Zeal real-time communication platform, testing team collaboration features, workspace management, and real-time messaging capabilities. Ensured seamless user experience and system reliability.',
        startDate: '2023-04',
        endDate: '2023-09',
        technologies: ['Manual Testing', 'Postman', 'JIRA', 'Performance Testing'],
        responsibilities: [
          'Tested real-time messaging and collaboration features',
          'Validated workspace and channel management functionalities',
          'Performed API testing for invitation and event systems',
          'Conducted performance and load testing for concurrent users',
          'Tested Kafka integration and event-driven workflows'
        ]
      },
      {
        id: 8,
        title: 'Client Projects QA',
        company: 'The Bootcamp Consultancy Private Limited',
        role: 'QA Engineer',
        category: 'Manual Testing',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=500&fit=crop',
        description: 'Quality assurance for multiple client projects involving data import scenarios, database management, and customer management applications. Ensured data accuracy and system reliability across various platforms.',
        startDate: '2020-01',
        endDate: '2022-07',
        technologies: ['Manual Testing', 'JIRA', 'SQL', 'Postman'],
        responsibilities: [
          'Tested data import and migration scenarios',
          'Validated database operations and stored procedures',
          'Performed functional testing for customer management features',
          'Tested notification systems and third-party integrations',
          'Created comprehensive test documentation and reports'
        ]
      }
    ],
    socialLinks: [
      {
        name: 'LinkedIn',
        url: 'https://linkedin.com',
        icon: '💼'
      },
      {
        name: 'GitHub',
        url: 'https://github.com',
        icon: '🐙'
      },
      {
        name: 'Twitter',
        url: 'https://twitter.com',
        icon: '🐦'
      }
    ],
    contact: {
      email: 'mona.qa@example.com',
      phone: '+91 9876543211',
      address: 'Available for remote work worldwide'
    }
  };

  getPortfolioData(type?: PortfolioType, profileKey?: string): PortfolioData {
    // If profileKey is provided, get from registry (highest priority)
    if (profileKey) {
      const profileData = this.profileRegistry.get(profileKey);
      if (profileData) {
        return profileData;
      }
    }
    
    // If no profileKey provided, use active profile key
    const activeProfileKey = this.getActiveProfileKey();
    if (activeProfileKey && !type) {
      const profileData = this.profileRegistry.get(activeProfileKey);
      if (profileData) {
        return profileData;
      }
    }
    
    // If type is provided, use type-based lookup
    if (type) {
      return type === 'qa' ? this.qaPortfolioData : this.developerPortfolioData;
    }
    
    // Fallback: check storage only if it matches current active profile
    const storedData = this.getPortfolioDataFromStorage();
    if (storedData) {
      const storedProfileKey = this.getActiveProfileKey();
      // Verify stored data matches active profile type
      const storedType = storedProfileKey.includes('-qa') ? 'qa' : 'developer';
      const currentType = this.currentType;
      if (storedType === currentType) {
        return storedData;
      }
    }
    
    // Final fallback to type-based lookup using currentType
    return this.currentType === 'qa' ? this.qaPortfolioData : this.developerPortfolioData;
  }

  getWorkExperience(type?: PortfolioType, profileKey?: string): WorkExperience[] {
    const data = this.getPortfolioData(type, profileKey);
    return data.workExperience;
  }

  getEducation(type?: PortfolioType, profileKey?: string): Education[] {
    const data = this.getPortfolioData(type, profileKey);
    return data.education;
  }

  getPortfolio(type?: PortfolioType, profileKey?: string): PortfolioItem[] {
    const data = this.getPortfolioData(type, profileKey);
    return data.portfolio;
  }

  getSocialLinks(type?: PortfolioType, profileKey?: string): SocialLink[] {
    const data = this.getPortfolioData(type, profileKey);
    return data.socialLinks;
  }
}

