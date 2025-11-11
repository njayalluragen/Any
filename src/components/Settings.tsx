import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Crown, Zap, Rocket, CheckCircle, Code } from 'lucide-react';

const SUBSCRIPTION_TIERS = [
  {
    name: 'free',
    displayName: 'Free',
    limit: 25,
    icon: Zap,
    features: ['25 submissions/month', 'Basic analytics', 'Email notifications', '48-hour support'],
  },
  {
    name: 'pro',
    displayName: 'Pro',
    limit: 100,
    icon: Crown,
    features: ['100 submissions/month', 'Advanced analytics', 'Priority email notifications', '24-hour support', 'Custom branding'],
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise',
    limit: 999999,
    icon: Rocket,
    features: ['Unlimited submissions', 'Full analytics suite', 'Real-time notifications', 'Dedicated support', 'Custom branding', 'API access'],
  },
];

export function Settings() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const updateSubscription = async (tier: string, limit: number) => {
    if (!profile) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          monthly_submission_limit: limit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Subscription updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update subscription. Please try again.' });
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const embedCode = `<!-- Contact Form Widget -->
<div id="contact-form-widget"></div>
<script src="${window.location.origin}/widget.js"></script>
<script>
  ContactForm.init({
    userId: '${profile?.id || 'YOUR_USER_ID'}',
    container: '#contact-form-widget'
  });
</script>`;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Plans</h2>
        <p className="text-gray-600">Choose the plan that works best for you</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`} />
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const Icon = tier.icon;
          const isCurrentPlan = profile?.subscription_tier === tier.name;

          return (
            <div
              key={tier.name}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all ${
                isCurrentPlan ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              <div className={`p-6 ${
                tier.name === 'pro' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
                tier.name === 'enterprise' ? 'bg-gradient-to-br from-gray-800 to-gray-900' :
                'bg-gray-100'
              }`}>
                <Icon className={`w-12 h-12 mb-4 ${
                  tier.name === 'free' ? 'text-blue-600' : 'text-white'
                }`} />
                <h3 className={`text-2xl font-bold mb-2 ${
                  tier.name === 'free' ? 'text-gray-900' : 'text-white'
                }`}>
                  {tier.displayName}
                </h3>
                <p className={`text-3xl font-bold ${
                  tier.name === 'free' ? 'text-gray-900' : 'text-white'
                }`}>
                  {tier.limit === 999999 ? '∞' : tier.limit}
                  <span className="text-lg font-normal opacity-80"> / month</span>
                </p>
              </div>

              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => updateSubscription(tier.name, tier.limit)}
                  disabled={loading || isCurrentPlan}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                  } disabled:opacity-50`}
                >
                  {isCurrentPlan ? 'Current Plan' : `Switch to ${tier.displayName}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <Code className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Embed Code</h3>
            <p className="text-gray-600 mb-4">Copy and paste this code into your website to add the contact form</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-100 font-mono">
            <code>{embedCode}</code>
          </pre>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(embedCode);
            setMessage({ type: 'success', text: 'Embed code copied to clipboard!' });
            setTimeout(() => setMessage(null), 3000);
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Copy Code
        </button>
      </div>
    </div>
  );
}
