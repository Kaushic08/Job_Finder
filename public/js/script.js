document.addEventListener('DOMContentLoaded', () => {
    const jobListingsContainer = document.getElementById('job-listings');
    const searchForm = document.getElementById('search-form');
    const searchLocation = document.getElementById('search-location');
    const searchSkills = document.getElementById('search-skills');
    const loadingIndicator = document.getElementById('loading-indicator');
    const statusMessage = document.getElementById('status-message');
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

    function saveAppliedJobIds(ids) {
        try {
            localStorage.setItem('appliedJobIds', JSON.stringify(ids));
        } catch (e) {
            console.error("Error saving appliedJobIds to localStorage", e);
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
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval + (interval === 1 ? " year ago" : " years ago");
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval + (interval === 1 ? " month ago" : " months ago");
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " minutes ago");
        return Math.max(0, Math.floor(seconds)) + " seconds ago";
    }

    function createJobCard(job, isApplied) {
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
                        <button
                            class="btn ${isApplied ? 'btn-success disabled' : 'btn-outline-primary'} apply-btn mt-auto w-100"
                            ${isApplied ? 'disabled' : ''}
                            data-job-id="${job._id}">
                            ${isApplied ? '<i class="fas fa-check"></i> Applied' : '<i class="fas fa-paper-plane"></i> Apply Now'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function displayMessage(message, type = 'info') {
         statusMessage.textContent = message;
         statusMessage.className = `alert alert-${type} text-center my-5`;
         statusMessage.style.display = 'block';
         jobListingsContainer.innerHTML = '';
    }

    function renderJobs(jobsData) {
        jobListingsContainer.innerHTML = '';
        statusMessage.style.display = 'none';

        if (jobsData.message && (!jobsData.jobs || jobsData.jobs.length === 0)) {
             displayMessage(jobsData.message, 'info');
             return;
        }

        if (!jobsData.jobs || jobsData.jobs.length === 0) {
             displayMessage('No jobs posted yet or found matching criteria.', 'info');
             return;
        }

        const appliedJobIds = getAppliedJobIds();
        jobsData.jobs.forEach(job => {
             if (job && job._id && job.title && job.company && job.location) {
                 const isApplied = appliedJobIds.includes(job._id);
                 const cardHTML = createJobCard(job, isApplied);
                 jobListingsContainer.insertAdjacentHTML('beforeend', cardHTML);
             } else {
                 console.warn("Skipping job card rendering due to missing essential data:", job);
             }
        });
    }

    async function fetchJobs(location = '', skills = '') {
        loadingIndicator.style.display = 'block';
        jobListingsContainer.innerHTML = '';
        statusMessage.style.display = 'none';

        let url = API_BASE_URL + '?';
        const params = [];
        if (location) params.push(`location=${encodeURIComponent(location)}`);
        if (skills) params.push(`skills=${encodeURIComponent(skills)}`);
        url += params.join('&');

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                 const errorMsg = data.message || `HTTP error! status: ${response.status}`;
                 throw new Error(errorMsg);
            }
            renderJobs(data);

        } catch (error) {
            console.error('Error fetching jobs:', error);
            displayMessage(`Could not load jobs: ${error.message}`, 'danger');
            jobListingsContainer.innerHTML = '';

        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    fetchJobs();

    if(searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const location = searchLocation.value.trim();
            const skills = searchSkills.value.trim();
            fetchJobs(location, skills);
        });
    }

    if(jobListingsContainer) {
        jobListingsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.apply-btn');

            if (button && button.classList.contains('apply-btn')) {
                const jobId = button.dataset.jobId;

                if (!jobId || button.disabled) return;

                const appliedJobIds = getAppliedJobIds();

                if (!appliedJobIds.includes(jobId)) {
                    appliedJobIds.push(jobId);
                    saveAppliedJobIds(appliedJobIds);

                    button.classList.remove('btn-outline-primary');
                    button.classList.add('btn-success', 'disabled');
                    button.innerHTML = '<i class="fas fa-check"></i> Applied';
                    button.disabled = true;

                    console.log(`Applied for job: ${jobId}`);
                }
            }
        });
    }
});