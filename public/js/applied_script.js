document.addEventListener('DOMContentLoaded', () => {
    const appliedJobListContainer = document.getElementById('applied-jobs-list');
    const loadingIndicator = document.getElementById('loading-indicator-applied');
    const statusMessageApplied = document.getElementById('status-message-applied');
    const currentYearSpan = document.getElementById('current-year');

    const API_BASE_URL = '/api/jobs';

    if(currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    function getAppliedJobIds() {
         try {
            return JSON.parse(localStorage.getItem('appliedJobIds') || '[]');
        } catch (e) {
            console.error("Error parsing appliedJobIds from localStorage", e);
            return [];
        }
    }

    function getTimeAgo(date) {
         if (!(date instanceof Date)) {
            date = new Date(date);
        }
        if (isNaN(date)) {
           return "Invalid date";
        }

        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = Math.floor(seconds / 31536000); if (interval >= 1) return interval + (interval === 1 ? " year ago" : " years ago");
        interval = Math.floor(seconds / 2592000); if (interval >= 1) return interval + (interval === 1 ? " month ago" : " months ago");
        interval = Math.floor(seconds / 86400); if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
        interval = Math.floor(seconds / 3600); if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
        interval = Math.floor(seconds / 60); if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " minutes ago");
        return Math.max(0, Math.floor(seconds)) + " seconds ago";
    }

    function createAppliedJobCard(job) {
         const skillsHTML = job.skills && job.skills.length > 0
            ? job.skills.map(skill => `<span class="badge bg-secondary me-1">${skill}</span>`).join('')
            : '<span class="text-muted fst-italic">None specified</span>';

        const shortDescription = job.description && job.description.length > 120
            ? job.description.substring(0, 120) + '...'
            : job.description || '<span class="text-muted fst-italic">No description provided.</span>';

        const timeAgo = getTimeAgo(job.postedDate);

        return `
            <div class="col-md-6 col-lg-4 d-flex align-items-stretch">
                <div class="card h-100 shadow-sm job-card w-100" data-job-id="${job._id}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title mb-1">${job.title || 'Untitled Job'}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${job.company || 'Unknown Company'} - <i class="fas fa-map-marker-alt"></i> ${job.location || 'Remote'}</h6>
                        <p class="card-text flex-grow-1 small">${shortDescription}</p>
                        <div class="mb-2">
                            <strong>Skills:</strong> ${skillsHTML}
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                             <span class="badge bg-info me-1">${job.employmentType || 'N/A'}</span>
                             <small class="text-muted" title="${new Date(job.postedDate).toLocaleString()}">Posted: ${timeAgo}</small>
                        </div>
                        <button class="btn btn-success disabled mt-auto w-100" disabled>
                            <i class="fas fa-check"></i> Applied
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function displayAppliedMessage(message, type = 'info') {
         statusMessageApplied.innerHTML = message; // Use innerHTML to allow link rendering
         statusMessageApplied.className = `alert alert-${type} text-center my-5`;
         statusMessageApplied.style.display = 'block';
         appliedJobListContainer.innerHTML = '';
    }

    function renderAppliedJobs(jobs) {
        appliedJobListContainer.innerHTML = '';
        statusMessageApplied.style.display = 'none';

        if (!jobs || jobs.length === 0) {
            displayAppliedMessage("You haven't applied for any jobs that are currently listed, or your applied jobs list is empty. <a href='index.html' class='alert-link'>Find some jobs!</a>", 'info');
            return;
        }

        jobs.forEach(job => {
             if (job && job._id && job.title && job.company && job.location) {
                 const cardHTML = createAppliedJobCard(job);
                 appliedJobListContainer.insertAdjacentHTML('beforeend', cardHTML);
             } else {
                  console.warn("Skipping applied job card rendering due to missing essential data:", job);
             }
        });
    }

    async function loadAppliedJobs() {
        loadingIndicator.style.display = 'block';
        appliedJobListContainer.innerHTML = '';
        statusMessageApplied.style.display = 'none';

        const appliedJobIds = getAppliedJobIds();

        if (appliedJobIds.length === 0) {
            displayAppliedMessage("You haven't applied for any jobs yet. <a href='index.html' class='alert-link'>Find some jobs!</a>", 'info');
            loadingIndicator.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(API_BASE_URL);
            const data = await response.json();

            if (!response.ok) {
                 const errorMsg = data.message || `HTTP error! status: ${response.status}`;
                 throw new Error(errorMsg);
            }

            if (!data.jobs) {
                 throw new Error(data.message || "No job data received from server.");
            }

            const appliedJobs = data.jobs.filter(job => job && job._id && appliedJobIds.includes(job._id));

            renderAppliedJobs(appliedJobs);

        } catch (error) {
            console.error('Error loading applied jobs:', error);
            displayAppliedMessage(`Could not load applied jobs: ${error.message}`, 'danger');
            appliedJobListContainer.innerHTML = '';

        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    loadAppliedJobs();
});