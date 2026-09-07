import re

with open('src/app/features/user/dashboard/dashboard.component.html', 'r') as f:
    content = f.read()

# Split out the parts
hero_end = content.find('<!-- ================= FEATURED VEHICLES ================= -->')
featured_start = hero_end
featured_end = content.find('<!-- ================= BROWSE BY TYPE ================= -->')
browse_start = featured_end
browse_end = content.find('<!-- ================= STATISTICS BAR ================= -->')
stats_start = browse_end
main_end = content.find('</main>')

hero = content[:hero_end]
featured = content[featured_start:featured_end]
browse = content[browse_start:browse_end]
stats_to_end = content[stats_start:main_end]

why_choose = """
  <!-- ================= WHY CHOOSE CAMBO RENT? ================= -->
  <section class="section-container max-w-7xl mx-auto w-full mt-6 mb-16">
    <div class="section-top-bar" style="margin-bottom: 24px;">
      <h2 class="section-heading">Why Choose Cambo Rent?</h2>
    </div>
    <div class="why-choose-grid">
      <div class="why-feature">
        <div class="why-icon green"><span class="material-symbols-outlined">verified_user</span></div>
        <div class="why-text">
          <h4>Secure Booking</h4>
          <p>Your booking is safe<br>and protected.</p>
        </div>
      </div>
      <div class="why-feature">
        <div class="why-icon green"><span class="material-symbols-outlined">request_quote</span></div>
        <div class="why-text">
          <h4>Transparent Pricing</h4>
          <p>No hidden fees.<br>What you see is<br>what you pay.</p>
        </div>
      </div>
      <div class="why-feature">
        <div class="why-icon green"><span class="material-symbols-outlined">directions_car</span></div>
        <div class="why-text">
          <h4>Quality Vehicles</h4>
          <p>Well-maintained<br>vehicles for a<br>smooth journey.</p>
        </div>
      </div>
      <div class="why-feature">
        <div class="why-icon green"><span class="material-symbols-outlined">support_agent</span></div>
        <div class="why-text">
          <h4>24/7 Support</h4>
          <p>We're here to help<br>you anytime,<br>anywhere.</p>
        </div>
      </div>
    </div>
  </section>
"""

new_content = hero + browse + featured + stats_to_end + why_choose + "</main>\n"

with open('src/app/features/user/dashboard/dashboard.component.html', 'w') as f:
    f.write(new_content)

print("Done")
