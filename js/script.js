

$(document).ready(function () {

   
    if (localStorage.getItem('darkMode') === 'true') {
        $('body').addClass('dark-mode');
        $('#darkModeToggle').text('☀️ Light Mode');
    }

    $('#darkModeToggle').on('click', function () {
        $('body').toggleClass('dark-mode');
        var isDark = $('body').hasClass('dark-mode');
        localStorage.setItem('darkMode', isDark);
        $(this).text(isDark ? '☀️ Light Mode' : '🌙 Dark Mode');
    });

    $('#menuToggle').on('click', function () {
        $('nav').toggleClass('open');
    });

    // Close menu when a link is clicked on mobile
    $('.nav-links a').on('click', function () {
        $('nav').removeClass('open');
    });


    function animateCounter($el) {
        var target = parseInt($el.attr('data-target'), 10);
        var duration = 1800;
        var step = Math.ceil(duration / target);
        var current = 0;

        var timer = setInterval(function () {
            current += Math.ceil(target / 60);
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            $el.text(current.toLocaleString());
        }, step);
    }


    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter($(entry.target));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        $('.stat-number').each(function () {
            observer.observe(this);
        });
    } else {
     
        $('.stat-number').each(function () {
            animateCounter($(this));
        });
    }

    $('#ratingRange').on('input', function () {
        $('#ratingValue').text($(this).val());
    });


    $('#feedbackForm').on('submit', function (event) {
        event.preventDefault();

        var feedbackName = $('#feedbackName').val().trim();
        var feedbackText = $('#feedbackText').val().trim();
        var rating = $('#ratingRange').val();

        if (feedbackName === '') {
            alert('Please enter your name before submitting feedback.');
            $('#feedbackName').focus();
            return;
        }

        if (feedbackText === '') {
            alert('Please write your feedback before submitting.');
            $('#feedbackText').focus();
            return;
        }

        alert(
            'Thank you, ' + feedbackName + '!\n\n' +
            'Your feedback has been received.\n' +
            'Rating given: ' + rating + '/10\n\n' +
            'We appreciate you taking the time to share your experience at FitZone.'
        );

        this.reset();
        $('#ratingValue').text('5');
    });



    var allServices = [];

    if ($('#servicesContainer').length) {
        $.getJSON('data/services.json', function (services) {
            allServices = services;
            renderServices(services);
        }).fail(function () {
            $('#servicesContainer').html(
                '<p class="loading-msg">Could not load services. Please try again later.</p>'
            );
        });
    }

    if ($('#featuredContainer').length) {
        $.getJSON('data/services.json', function (services) {
            var featured = services.slice(0, 3);
            var output = '';
            featured.forEach(function (s) {
                output += buildServiceCard(s);
            });
            $('#featuredContainer').html(output);
        }).fail(function () {
            $('#featuredContainer').html(
                '<p class="loading-msg">Could not load featured programs.</p>'
            );
        });
    }

   
    function renderServices(services) {
        if (services.length === 0) {
            $('#servicesContainer').html('');
            $('#noResults').show();
            return;
        }

        $('#noResults').hide();
        var output = '';
        services.forEach(function (s) {
            output += buildServiceCard(s);
        });
        $('#servicesContainer').html(output);
    }

    
    function buildServiceCard(s) {
        return (
            '<article class="card service-card" data-category="' + s.category + '" data-price="' + s.price + '" data-name="' + s.name.toLowerCase() + '">' +
            '<span class="service-badge">' + s.category + '</span>' +
            '<img src="' + s.image + '" alt="' + s.name + ' program at FitZone">' +
            '<h3>' + s.name + '</h3>' +
            '<p>' + s.description + '</p>' +
            '<div class="service-price">$' + s.price + '<span>/month</span></div>' +
            '</article>'
        );
    }


    $('#searchInput').on('keyup', function () {
        applyFilters();
    });


    $('#categoryFilter').on('change', function () {
        applyFilters();
    });



    $('#sortFilter').on('change', function () {
        applyFilters();
    });

    // Combined filter + sort + search logic
    function applyFilters() {
        if (allServices.length === 0) return;

        var searchVal  = ($('#searchInput').val() || '').toLowerCase().trim();
        var category   = ($('#categoryFilter').val() || 'all');
        var sortVal    = ($('#sortFilter').val() || 'default');

        // 1. Filter by search text
        var filtered = allServices.filter(function (s) {
            var nameMatch = s.name.toLowerCase().indexOf(searchVal) > -1;
            var catMatch  = (category === 'all' || s.category === category);
            return nameMatch && catMatch;
        });

        // 2. Sort
        if (sortVal === 'price-asc') {
            filtered.sort(function (a, b) { return a.price - b.price; });
        } else if (sortVal === 'price-desc') {
            filtered.sort(function (a, b) { return b.price - a.price; });
        } else if (sortVal === 'name-asc') {
            filtered.sort(function (a, b) { return a.name.localeCompare(b.name); });
        }

        renderServices(filtered);
    }

    var visibleItems = $('.gallery-item').length;

    $('.filter-btn').on('click', function () {
        var filter = $(this).data('filter');

        // Update active button style
        $('.filter-btn').removeClass('active-btn');
        $(this).addClass('active-btn');

        if (filter === 'all') {
            $('.gallery-item').fadeIn(350);
            visibleItems = $('.gallery-item').length;
        } else {
            $('.gallery-item').hide();
            $('.' + filter).fadeIn(350);
            visibleItems = $('.' + filter).length;
        }

        $('#galleryCount').text(visibleItems);
    });


    var currentImageIndex = 0;
    var visibleImages = [];

    $(document).on('click', '.gallery-item', function () {
        visibleImages = $('.gallery-item:visible').toArray();
        currentImageIndex = visibleImages.indexOf(this);

        var src = $(this).attr('src');
        var alt = $(this).attr('alt');
        $('#lightboxImg').attr('src', src).attr('alt', alt);
        $('#lightboxCaption').text(alt);
        $('#lightbox').addClass('active').hide().fadeIn(300);
    });

    
    $('#lightboxClose').on('click', function () {
        $('#lightbox').fadeOut(250, function () {
            $(this).removeClass('active');
        });
    });

   
    $('#lightbox').on('click', function (e) {
        if ($(e.target).is('#lightbox')) {
            $(this).fadeOut(250, function () {
                $(this).removeClass('active');
            });
        }
    });

   
    $('#lightboxNext').on('click', function (e) {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
        updateLightbox();
    });

  
    $('#lightboxPrev').on('click', function (e) {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
        updateLightbox();
    });

    function updateLightbox() {
        var img = visibleImages[currentImageIndex];
        var src = $(img).attr('src');
        var alt = $(img).attr('alt');
        $('#lightboxImg').attr('src', src).attr('alt', alt);
        $('#lightboxCaption').text(alt);
    }


    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $('#lightbox').hasClass('active')) {
            $('#lightbox').fadeOut(250, function () {
                $(this).removeClass('active');
            });
        }
        if (e.key === 'ArrowRight' && $('#lightbox').hasClass('active')) {
            $('#lightboxNext').click();
        }
        if (e.key === 'ArrowLeft' && $('#lightbox').hasClass('active')) {
            $('#lightboxPrev').click();
        }
    });

    $(document).on('mouseenter', '.gallery-item', function () {
        $(this).css('opacity', '0.85');
    }).on('mouseleave', '.gallery-item', function () {
        $(this).css('opacity', '1');
    });


    
   $('#contactForm').on('submit', function (event) {
    event.preventDefault();

    var name    = $('#name').val().trim();
    var email   = $('#email').val().trim();
    var phone   = $('#phone').val().trim();
    var message = $('#message').val().trim();

    var emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    var phonePattern = /^[0-9]+$/;

    var valid = true;
    var errors = [];

    $('.field-error').text('');
    $('input, textarea, select').removeClass('input-error');

    if (name === '') {
        $('#nameError').text('Full name cannot be empty.');
        $('#name').addClass('input-error');
        errors.push('• Full name cannot be empty.');
        valid = false;
    }

    if (!emailPattern.test(email)) {
        $('#emailError').text('Please enter a valid email address (e.g. you@example.com).');
        $('#email').addClass('input-error');
        errors.push('• Please enter a valid email address.');
        valid = false;
    }

    if (!phonePattern.test(phone) || phone.length < 7) {
        $('#phoneError').text('Phone number must contain numbers only and be at least 7 digits.');
        $('#phone').addClass('input-error');
        errors.push('• Phone number must be at least 7 digits and numeric only.');
        valid = false;
    }

    if (message.length < 20) {
        $('#messageError').text('Message must contain at least 20 characters (currently ' + message.length + ').');
        $('#message').addClass('input-error');
        errors.push('• Message must be at least 20 characters (currently ' + message.length + ').');
        valid = false;
    }

    // Show alert if there are errors
    if (!valid) {
        alert("Please fix the following errors:\n\n" + errors.join("\n"));
        return;
    }

    alert(
        'Thank you, ' + name + '!\n\n' +
        'Your message has been sent successfully.\n\n' +
        '── Submitted Information ──\n' +
        '• Email:   ' + email + '\n' +
        '• Phone:   ' + phone + '\n' +
        '• Message: ' + message + '\n\n' +
        'Our team will contact you within 24 hours.'
    );
        this.reset();
        $('.field-error').text('');
        $('#charCount').text('0 / 20 characters minimum');
    });


    $('#message').on('input', function () {
        var len = $(this).val().length;
        var label = len + ' / 20 characters minimum';
        $('#charCount').text(label);

        if (len >= 20) {
            $('#charCount').css('color', '#22c55e');
        } else {
            $('#charCount').css('color', '#94a3b8');
        }
    });


    $('#registerForm').on('submit', function (event) {
        event.preventDefault();

        var username        = $('#username').val().trim();
        var regEmail        = $('#regEmail').val().trim();
        var password        = $('#password').val();
        var confirmPassword = $('#confirmPassword').val();
        var membership      = $('#membershipType').val();
        var termsChecked    = $('#termsCheck').is(':checked');

        var emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        var valid = true;

        $('.field-error').text('');
        $('input, select').removeClass('input-error');

        if (username.length < 4) {
            $('#usernameError').text('Username must be at least 4 characters long.');
            $('#username').addClass('input-error');
            if (valid) $('#username').focus();
            valid = false;
        }

        if (!emailPattern.test(regEmail)) {
            $('#regEmailError').text('Please enter a valid email address.');
            $('#regEmail').addClass('input-error');
            valid = false;
        }

        if (password.length < 8) {
           
            $('#password').addClass('input-error');
            valid = false;
        }

        if (password !== confirmPassword) {
            $('#confirmError').text('Passwords do not match. Please try again.');
            $('#confirmPassword').addClass('input-error');
            valid = false;
        }

        if (membership === '') {
            $('#membershipError').text('Please select a membership plan to continue.');
            $('#membershipType').addClass('input-error');
            valid = false;
        }

        if (!termsChecked) {
            $('#termsError').text('You must agree to the Terms & Conditions to register.');
            valid = false;
        }

        if (!valid) return;

        alert(
            'Registration Successful! 🎉\n\n' +
            'Welcome to FitZone, ' + username + '!\n\n' +
            '── Account Details ──\n' +
            '• Username:   ' + username + '\n' +
            '• Email:      ' + regEmail + '\n' +
            '• Membership: ' + membership + '\n\n' +
            'You will receive a confirmation email shortly.\n' +
            'See you at FitZone!'
        );

        this.reset();
        $('#strengthMessage').text('').removeClass('weak medium strong');
        $('#strengthBar').css({ width: '0', background: '' });
        $('.field-error').text('');
    });



    $('#password').on('keyup', function () {
        var pw = $(this).val();
        var msg = $('#strengthMessage');
        var bar = $('#strengthBar');

        if (pw.length === 0) {
            msg.text('').removeClass('weak medium strong');
            bar.css({ width: '0', background: '' });
        } else if (pw.length < 5) {
            msg.text('Weak password').removeClass('medium strong').addClass('weak');
            bar.css({ width: '25%', background: '#ef4444' });
        } else if (pw.length < 8) {
            msg.text('Medium password').removeClass('weak strong').addClass('medium');
            bar.css({ width: '60%', background: '#f59e0b' });
        } else {
            var hasUpper   = /[A-Z]/.test(pw);
            var hasNumber  = /[0-9]/.test(pw);
            var hasSpecial = /[^A-Za-z0-9]/.test(pw);
            var extras = (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);

            if (extras >= 2) {
                msg.text('Strong password').removeClass('weak medium').addClass('strong');
                bar.css({ width: '100%', background: '#22c55e' });
            } else {
                msg.text('Medium password — add numbers or symbols').removeClass('weak strong').addClass('medium');
                bar.css({ width: '70%', background: '#f59e0b' });
            }
        }
    });

    $('#membershipType').on('change', function () {
        var selected = $(this).val();
        var info = {
            'Basic':   'Basic plan: Full gym access + 2 group classes/week. $40/month.',
            'Premium': 'Premium plan: Unlimited classes + 2 coaching sessions + nutrition. $75/month.',
            'Elite':   'Elite plan: Everything in Premium + unlimited coaching + body tracking. $120/month.'
        };

        if (selected && info[selected]) {
            $('#membershipError').text('').css('color', '#22c55e').text('✔ ' + info[selected]);
        } else {
            $('#membershipError').text('').css('color', '');
        }
    });

});