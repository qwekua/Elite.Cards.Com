/**
 * Component System
 * 
 * This script handles loading and managing components for the ElitCards application.
 * It provides a smooth transition between different pages by dynamically loading HTML components.
 */

// Component cache to avoid unnecessary fetches
const componentCache = {};

// Available components
const COMPONENTS = {
    HOME: 'components/home.html',
    PRODUCTS: 'components/products.html',
    DASHBOARD: 'components/dashboard.html',
    CART: 'components/cart.html',
    MODALS: 'components/modals.html'
};

// Wait for DOM to be fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', function() {
    // Component container element
    const componentContainer = document.getElementById('component-container');
    const mainContent = document.getElementById('main-content');

    // Modal container element (will be created when modals are loaded)
    let modalContainer = null;

    /**
     * Load a component into the container
     * @param {string} componentUrl - URL of the component to load
     * @param {boolean} append - Whether to append the component or replace existing content
     * @returns {Promise} - Promise that resolves when the component is loaded
     */
    async function loadComponent(componentUrl, append = false) {
    try {
        // Check if component is already in cache
        if (!componentCache[componentUrl]) {
            const response = await fetch(componentUrl);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentUrl}`);
            }
            componentCache[componentUrl] = await response.text();
        }

        // If not appending, fade out current content
        if (!append) {
            componentContainer.style.opacity = '0';
            
            // Wait for fade out animation
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Clear container
            componentContainer.innerHTML = '';
        }

        // Create a temporary container for the component
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = componentCache[componentUrl];

        // Append all child nodes to the component container
        while (tempContainer.firstChild) {
            componentContainer.appendChild(tempContainer.firstChild);
        }

        // Fade in the new content
        componentContainer.style.opacity = '1';

        // Return the loaded component
        return componentContainer;
    } catch (error) {
        console.error('Error loading component:', error);
        componentContainer.innerHTML = `<div class="error-message">Failed to load component: ${error.message}</div>`;
        return null;
    }
}

    /**
     * Initialize the component system
     */
    async function initComponents() {
        // Add fade transition to component container
        componentContainer.style.transition = 'opacity 0.3s ease';
        
        // Load modals component (always present)
        await loadComponent(COMPONENTS.MODALS, true);
        
        // Create a container for modals if it doesn't exist
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'modal-container';
            document.body.appendChild(modalContainer);
            
            // Move all modals to the modal container
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => {
                modalContainer.appendChild(modal);
            });
        }
        
        // Load home component by default
        await loadComponent(COMPONENTS.HOME);
        
        console.log('Components initialized successfully');
    }

    // Initialize components
    initComponents();

    // Export functions for use in other scripts
    window.Components = {
        load: loadComponent,
        COMPONENTS: COMPONENTS
    };
});