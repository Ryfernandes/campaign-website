import { useEffect, useRef, useState } from 'react';
import './Home.css';
import { useScrollObserver } from './ScrollObserver';
import ryanImage from './assets/images/ryan-fernandes.jpg';
import reyanshImage from './assets/images/reyansh-bahl.jpg';

function Home() {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [imagesLoaded, setImagesLoaded] = useState(0);
    const [introComplete, setIntroComplete] = useState(false);
    const virtualScrollRef = useRef(0);
    const sectionsRef = useRef<(HTMLElement | null)[]>([]);
    const imagesInPositionRef = useRef(false);
    
    // Check for mobile device and skip intro animation if needed
    useEffect(() => {
        // Define what counts as a "small screen" - typically 768px or less
        const isMobileDevice = window.innerWidth <= 768;
        
        if (isMobileDevice) {
            // Skip intro animation on mobile
            setIntroComplete(true);
            document.body.style.overflow = ''; // Ensure scrolling is enabled
        } else {
            // On desktop, start with standard behavior
            window.scrollTo(0, 0);
            document.body.style.overflow = 'hidden'; // Prevent scrolling initially
        }
    }, []);
    
    // Scroll to top on initial load - only needed for desktop now
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [introComplete]);
    
    // Activate the scroll observer for animation effects
    useScrollObserver();
    
    // Handle virtual scrolling and real scrolling
    useEffect(() => {
        // Handle wheel events to capture scroll during intro animation
        const handleWheel = (e: WheelEvent) => {
            // Only prevent default scroll if intro animation isn't complete
            if (!introComplete) {
                e.preventDefault();
                
                // Update virtual scroll based on wheel delta
                virtualScrollRef.current += e.deltaY;
                virtualScrollRef.current = Math.max(0, virtualScrollRef.current);
                
                // Calculate slide amount based on virtual scroll
                const slideAmount = Math.min(100, virtualScrollRef.current / 10);
                setScrollPosition(slideAmount);
                
                // Mark when we've reached the target scroll amount but haven't completed yet
                // The actual unlock will happen in the transform completion effect
                if (slideAmount >= 100) {
                    imagesInPositionRef.current = true;
                }
            }
        };
        
        // Handle real scroll events (after intro is complete)
        const handleScroll = () => {
            if (introComplete) {
                setScrollPosition(100); // Keep images at final position
            }
        };
        
        // Add wheel event listener with passive: false to allow preventDefault
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('scroll', handleScroll);
            document.body.style.overflow = '';
        };
    }, [introComplete]);
    
    // Calculate image slide positions based on scroll - modify for mobile
    const slideAmount = Math.min(100, scrollPosition);
    
    // Left image slides from -100% (hidden) to 0% (visible) - or starts at 0 if intro complete
    const leftImagePosition = introComplete ? 0 : -100 + slideAmount;
    
    // Right image slides from 100% (hidden) to 0% (visible) - or starts at 0 if intro complete
    const rightImagePosition = introComplete ? 0 : 100 - slideAmount;
    
    // Effect to complete intro when images are actually in their final positions
    useEffect(() => {
        if (!introComplete && imagesInPositionRef.current) {
            // Check if images have reached their final positions or very close
            if (Math.abs(leftImagePosition) < 1 && Math.abs(rightImagePosition) < 1) {
                // Small delay to ensure smooth transition
                const timer = setTimeout(() => {
                    // Ensure we're at top of page before unlocking scroll
                    window.scrollTo(0, 0);
                    
                    // Unlock scrolling and mark intro as complete
                    setIntroComplete(true);
                    document.body.style.overflow = ''; // Restore normal scrolling
                }, 150);
                
                return () => clearTimeout(timer);
            }
        }
    }, [introComplete, leftImagePosition, rightImagePosition]);
    
    // Track image loading
    const handleImageLoad = () => {
        setImagesLoaded(prev => prev + 1);
    };
    
    // Add "loaded" class to hero section when both images are loaded
    const heroSectionClass = imagesLoaded >= 2 ? "hero-section loaded" : "hero-section";
    
    // Carousel functionality
    useEffect(() => {
        if (introComplete) {
            const track = document.getElementById('carouselTrack');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            
            if (!track || !prevBtn || !nextBtn) return;
            
            let currentIndex = 0;
            const itemCount = 9; // Total number of carousel items
            
            const updateCarousel = () => {
                if (!track) return;
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            };
            
            const goToPrevSlide = () => {
                // Loop to the last slide if at the beginning
                currentIndex = currentIndex === 0 ? itemCount - 1 : currentIndex - 1;
                updateCarousel();
            };
            
            const goToNextSlide = () => {
                // Loop to the first slide if at the end
                currentIndex = currentIndex === itemCount - 1 ? 0 : currentIndex + 1;
                updateCarousel();
            };
            
            // Add event listeners with direct function calls
            prevBtn.addEventListener('click', goToPrevSlide);
            nextBtn.addEventListener('click', goToNextSlide);
            
            // Initialize carousel
            updateCarousel();
            
            // Proper cleanup with the same function references
            return () => {
                prevBtn.removeEventListener('click', goToPrevSlide);
                nextBtn.removeEventListener('click', goToNextSlide);
            };
        }
    }, [introComplete]);
    
    return (
        <div className="campaign-container">
            {/* Hero section with candidate images */}
            <section className={heroSectionClass} ref={el => { sectionsRef.current[0] = el; }}>
                <div className="candidate-images">
                    <div 
                        className="candidate-img left"
                        style={{ transform: `translateX(${leftImagePosition}%)` }}
                    >
                        <img 
                            src={ryanImage}
                            alt="Ryan Fernandes" 
                            onLoad={handleImageLoad}
                        />
                    </div>
                    <div 
                        className="candidate-img right"
                        style={{ transform: `translateX(${rightImagePosition}%)` }}
                    >
                        <img 
                            src={reyanshImage}
                            alt="Reyansh Bahl" 
                            onLoad={handleImageLoad}
                        />
                    </div>
                </div>
                <div className="hero-content">
                    <h1 className="fade-in">RYAN | REYANSH</h1>
                    <h2 className="fade-in delay-1">Bringing the best to y/cs</h2>
                </div>
                
                {/* Scroll indicator - only show if not completed */}
                {!introComplete && (
                    <div className="scroll-indicator">
                        <span>Scroll Down</span>
                        <div className="scroll-arrow"></div>
                    </div>
                )}
            </section>
            
            {/* Platform section */}
            <section className="platform-section" ref={el => { sectionsRef.current[1] = el; }}>
                <div className="section-content slide-in-right">
                    <h2>Our Platform</h2>
                    <div className="platform-grid">
                        <div className="platform-item">
                            <h3>Collaboration</h3>
                            <p>Opening up avenues for y/cs products to build off of each other and share data</p>
                        </div>
                        <div className="platform-item">
                            <h3>Branding</h3>
                            <p>Bringing our developers into the spotlight by working with YDN and other publications</p>
                        </div>
                        <div className="platform-item">
                            <h3>Benefits</h3>
                            <p>Making y/cs membership more rewarding with bigger social funds, team events</p>
                        </div>
                        <div className="platform-item">
                            <h3>Expansion</h3>
                            <p>Connecting the Ivy League tech orgs for devleoper networking conferences</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* In Detail section with carousel */}
            <section className="in-detail-section" ref={el => { sectionsRef.current[2] = el; }}>
                <div className="section-content slide-in-bottom">
                    <h2>In Detail</h2>
                    <div className="carousel-container">
                        <div className="carousel-track" id="carouselTrack">
                            <div className="carousel-item">
                                <h3>Product Crossovers</h3>
                                <p>We see a lot of potential in sharing data/services between y/cs products. A ymeets integration in YaleClubs, adding friends on all products through Yalies, you name it! While we won't steer the ship on these crossovers, we will certainly provide the framework, allowing team leads and developers to ultimately decide what is best for their product</p>
                                <div className="slide-counter">1/9</div>
                            </div>
                            <div className="carousel-item">
                                <h3>Visibility</h3>
                                <p>Utilizing our existing connections and Reyansh's presence on the YDN tech team, we will greatly increase the (positive) coverage of y/cs in the news cycle with regular spotlights on individual teams and stories to promote releases</p>
                                <div className="slide-counter">2/9</div>
                            </div>
                            <div className="carousel-item">
                                <h3>Funding</h3>
                                <p>By applying for funding as individual products rather than one umbrella organization, we will greatly increase our returns during funding rounds. Additionally, we will utilize the connections with college deans and DUS's that Ryan is forming with y/labs in order to secure more funding from Yale departments</p>
                                <div className="slide-counter">3/9</div>
                            </div>
                            <div className="carousel-item">
                                <h3>Developer Benefits</h3>
                                <p>We all put in a lot of hard work for y/cs and deserve more benefits for contributing to the society! In addition to the soft benefits of networking, YDN coverage, and more, we will increase the social fund for team dinners and other events</p>
                                <div className="slide-counter">4/9</div>
                            </div>
                            <div className="carousel-item">
                                <h3>Ivy League Collaboration</h3>
                                <p>Did you know that there is a Harvard Computer Society? While they are inferior, we would love to get to know them! Next year, you can expect a conference with the two organizations and potentially others from the Ivy League for student developers to chat, share projects, and get inspired</p>
                                <div className="slide-counter">5/9</div>
                            </div>
                            <div className="carousel-item">
                                <h3>Software Recruiting</h3>
                                <p>Smaller tech companies are looking to recruit top talent from universities like Yale! We will do the heavy lifting for you, curating y/cs-exclusive chats with representatives from these companies to learn more about their internship and job hiring processes</p>
                                <div className="slide-counter">6/9</div>
                            </div>
                            <div className="carousel-item">
                                <h3>Startup Advertisement</h3>
                                <p>y/cs developers are ambitious, and we know that many of you have other projects and startups that you are looking to promote! As a part of our increased press coverage, we will create a platform to highlight side projects from within y/cs, allowing us to show more innovation coming out of the society while helping developers with their ventures</p>
                                <div className="slide-counter">7/9</div>
                            </div>
                            <div className="carousel-item">
                                <h3>Club Partnerships</h3>
                                <p>As much as we would like to, y/cs can't do everything! We will continue the work done this year (with Design at Yale and YURA) to partner y/cs with more undergraduate organizations. This holds the key both in attracting a more committed user base and bettering our products beyond the source code</p>
                                <div className="slide-counter">8/9</div>
                            </div>
                            <div className="carousel-item">
                                <h3>Communication</h3>
                                <p>y/cs members should know what is going on elsewhere in the society! This is why we will revive the newsletter in a shortened and more focused manner to bring one story bi-weekly on updates from an individual team</p>
                                <div className="slide-counter">9/9</div>
                            </div>
                        </div>
                        <div className="carousel-controls">
                            <button className="nav-button prev" id="prevBtn" aria-label="Previous slide">&#10094;</button>
                            <button className="nav-button next" id="nextBtn" aria-label="Next slide">&#10095;</button>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* About section */}
            <section className="about-section" ref={el => { sectionsRef.current[3] = el; }}>
                <div className="section-content slide-in-left">
                    <h2>About Us</h2>
                    <div className="candidate-profiles">
                        <div className="candidate-profile">
                            <div className="candidate-image">
                                <img src={ryanImage} alt="Ryan Fernandes" />
                            </div>
                            <h3>Ryan Fernandes</h3>
                            <div className="candidate-info">Natick, Massachusetts • Trumbull</div>
                            <p>
                                After being appointed to lead RDB in January, I led the project through a complete overhaul—rebranding to <a href="https://yalelabs.io/" target="_blank" rel="noopener noreferrer" className="text-[#ffab40]" aria-label="Vote Here">y/labs</a> and enabling professors and students to update research listings in real time. Our robust backend could have been a semester's project alone, but we did more by revamping the site's appearance, improving the search/sort, and tracking engagement for professors. Now, I am orchestrating our release through conversations with college deans and a release party, all while planning ahead for future expansions of the site. I have attended every hackathon in full and co-instructed the y/cs Coding Bootcamp.
                            </p>
                        </div>
                        <div className="candidate-profile">
                            <div className="candidate-image">
                                <img src={reyanshImage} alt="Reyansh Bahl" />
                            </div>
                            <h3>Reyansh Bahl</h3>
                            <div className="candidate-info">Cary, North Carolina • Benjamin Franklin</div>
                            <p>
                                I'm Reyansh Bahl, a rising sophomore in Benjamin Franklin College. I've been a part of y/cs as a developer on the <a href="https://coursetable.com/catalog" target="_blank" rel="noopener noreferrer" className="text-[#ffab40]" aria-label="Vote Here">CourseTable</a> team, where I've worked on various frontend and backend features including sorting by last added and modified timestamps, incremental course database updates, and importing others' worksheets into your worksheets. Outside of CourseTable, I'm involved in other collaborative projects — as a developer on the YDN tech team and as an AI engineering intern at a startup named ShiftRx. I've also been working with Ryan to build PaperBridge, an AI-powered platform to discover and comprehend complex research papers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Campaign Video section */}
            <section className="video-section" ref={el => { sectionsRef.current[4] = el; }}>
                <div className="section-content slide-in-right">
                    <h2>Campaign Video</h2>
                    <div className="video-container">                
                        <div className="video-transcript">
                            <p>Members of the Yale Computer Society, my name is Ryan Fernandes, current development lead of y/labs. Along with my running mate, Reyansh Bahl, I would like to give you a glimpse into our vision for the future of y/cs.</p>
                            
                            <p>There is no doubt that we are one of the coolest clubs at Yale. Together, we build products utilized by the vast majority of the community—professors and students alike. However, there is still room to grow. While most students are familiar with Yalies, CourseTable and the like, they know surprisingly little about y/cs itself. This could just be seen as a branding issue, but I think it points to a deeper disconnect at the heart of the society.</p>
                            
                            <p>As president, I will bring together the independent products of the Yale Computer Society and uncover ways in which we can utilize shared infrastructures and data. For instance, we can use data about professors from CourseTable in y/labs, integrate y/meets into YaleClubs as a tool for club leaders to schedule events, and allow students to add friends on our various projects through the single hub of Yalies. Reyansh and I will provide the resources to craft these relationships, but respect the autonomy of each team and leave the creative license where it belongs: in the hands of our developers.</p>
                            
                            <p className="highlight-text">What's more, Reyansh and I believe that being a y/cs member is a gift and an opportunity, not a chore.</p>
                            
                            <p>As a result, we are deeply committed to augmenting the benefits of being a part of the society. With a new strategy to UoFC funding rounds, we will increase our effectiveness in securing funds—feeding directly into team dinners and socials. Additionally, we will broaden the scope of the society with new events, presenting members with opportunities to network with tech companies and other student developers in the Ivy League, such as the Harvard Computer Society. Lastly, we will create a platform within y/cs to showcase the startups and independent projects of developers, so we can display more work from within the society and help members with their ventures at the same time.</p>
                        </div>
                        <div className="video-cta">
                            <a href="https://youtu.be/zoROAWafu3s" target="_blank" rel="noopener noreferrer" className="watch-button">
                                <span className="play-icon">▶</span>
                                Watch Now!
                            </a>
                            <p className="video-note">Hear our full vision for the future of y/cs</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Footer */}
            <footer>
                <p>Ryan | Reyansh 2025</p>
            </footer>
            
            {/* Floating Vote Button - only shows after intro animation */}
            {introComplete && (
                <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSe5U9Xrnh3a_SUv6nlKDLr9nUn7ZCAfMw5O29pRwcqe-fDY0g/viewform" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="vote-button"
                    aria-label="Vote Here"
                >
                    Vote Here!
                </a>
            )}
        </div>
    );
}

export default Home;