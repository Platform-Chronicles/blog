// Add language labels to code blocks
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('div[class*="language-"]').forEach(function(wrapper) {
    // Get language from class name (e.g., 'language-yaml')
    const langMatch = wrapper.className.match(/language-(\w+)/);
    if (langMatch) {
      const lang = langMatch[1];
      wrapper.setAttribute('data-lang', lang);
    }
  });
});
