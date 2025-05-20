import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { getPlans } from '../services/supabase';
import { useUser } from '../contexts/UserContext';
import LoadingIndicator from '../components/ui/LoadingIndicator';

type Plan = {
  id: string;
  name: string;
  monthly_price: number;
  annual_price: number;
  monthly_credits: number;
  features: string[];
  is_popular: boolean;
};

const PricingPage: React.FC = () => {
  const { user } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getPlans();
        setPlans(plansData);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Fallback plans in case the database isn't set up yet
  const fallbackPlans: Plan[] = [
    {
      id: '1',
      name: 'Free',
      monthly_price: 0,
      annual_price: 0,
      monthly_credits: 5000,
      features: [
        '5,000 characters per month',
        'Basic humanization',
        'Standard processing speed',
        'Email support'
      ],
      is_popular: false
    },
    {
      id: '2',
      name: 'Basic',
      monthly_price: 9.99,
      annual_price: 99.99,
      monthly_credits: 50000,
      features: [
        '50,000 characters per month',
        'Advanced humanization',
        'Faster processing speed',
        'Save up to 10 documents',
        'Priority email support'
      ],
      is_popular: true
    },
    {
      id: '3',
      name: 'Premium',
      monthly_price: 19.99,
      annual_price: 199.99,
      monthly_credits: 150000,
      features: [
        '150,000 characters per month',
        'Premium humanization',
        'Fastest processing speed',
        'Unlimited document storage',
        'Priority support',
        'API access'
      ],
      is_popular: false
    },
    {
      id: '4',
      name: 'Enterprise',
      monthly_price: 49.99,
      annual_price: 499.99,
      monthly_credits: 500000,
      features: [
        '500,000 characters per month',
        'Enterprise-grade humanization',
        'Dedicated account manager',
        'Custom integration options',
        'Advanced analytics',
        'Full API access'
      ],
      is_popular: false
    }
  ];

  const displayPlans = plans.length > 0 ? plans : fallbackPlans;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that's right for you and start humanizing your AI-generated text today.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 sm:flex sm:justify-center">
          <div className="relative bg-white rounded-lg shadow-sm flex flex-col sm:flex-row p-1">
            <button
              type="button"
              className={`relative py-2 px-6 border rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly billing
            </button>
            <button
              type="button"
              className={`relative py-2 px-6 border rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto ${
                billingPeriod === 'annual'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setBillingPeriod('annual')}
            >
              Annual billing <span className="text-blue-500 font-semibold">Save 16%</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <LoadingIndicator size="large" message="Loading pricing plans..." />
          </div>
        ) : (
          <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-x-6">
            {displayPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative p-8 bg-white border rounded-lg shadow-sm flex flex-col ${
                  plan.is_popular ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute top-0 right-0 -mt-3 mr-3">
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  <p className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-4xl font-extrabold tracking-tight">
                      ${billingPeriod === 'monthly' ? plan.monthly_price : plan.annual_price}
                    </span>
                    <span className="ml-1 text-xl font-semibold">
                      {billingPeriod === 'monthly' ? '/month' : '/year'}
                    </span>
                  </p>
                  <p className="mt-6 text-gray-500">
                    {plan.monthly_credits.toLocaleString()} characters per month
                  </p>

                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    to={user ? "/dashboard" : "/signup"}
                    className={`block w-full py-3 px-4 rounded-md shadow text-center text-sm font-medium ${
                      plan.is_popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {user ? 'Upgrade to ' + plan.name : 'Get started'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-gray-50 rounded-lg px-6 py-8 sm:p-10 lg:flex lg:items-center">
          <div className="flex-1">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Enterprise plan</h3>
              <p className="mt-2 text-gray-600">
                Need more characters or custom features? We offer tailored solutions for businesses with high-volume needs.
              </p>
            </div>
            <div className="mt-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="ml-3 text-sm text-gray-700">Custom character limits</p>
              </div>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="ml-3 text-sm text-gray-700">Dedicated account manager</p>
              </div>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="ml-3 text-sm text-gray-700">Custom API integration</p>
              </div>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="ml-3 text-sm text-gray-700">Advanced analytics dashboard</p>
              </div>
            </div>
          </div>
          <div className="mt-8 lg:mt-0 lg:ml-8">
            <Link
              to="/contact"
              className="block w-full py-3 px-6 rounded-md shadow bg-blue-600 text-white text-center font-medium hover:bg-blue-700"
            >
              Contact sales
            </Link>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Frequently asked questions</h2>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <dl className="space-y-8">
              <div>
                <dt className="text-lg font-medium text-gray-900">
                  How does the character count work?
                </dt>
                <dd className="mt-2 text-gray-600">
                  Characters are counted based on the input text you submit for humanization. Each plan includes a monthly character allowance that resets at the beginning of your billing cycle.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-medium text-gray-900">
                  Can I upgrade or downgrade my plan?
                </dt>
                <dd className="mt-2 text-gray-600">
                  Yes, you can change your plan at any time. If you upgrade, you'll be charged the prorated difference for the remainder of your billing cycle. If you downgrade, the new plan will take effect at the start of your next billing cycle.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-medium text-gray-900">
                  Do unused characters roll over?
                </dt>
                <dd className="mt-2 text-gray-600">
                  No, unused characters do not roll over to the next month. Your character allowance resets at the beginning of each billing cycle.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-medium text-gray-900">
                  Is there a limit to how much text I can humanize at once?
                </dt>
                <dd className="mt-2 text-gray-600">
                  Yes, you can humanize up to 15,000 characters in a single request. For longer texts, you can split them into multiple requests.
                </dd>
              </div>
              <div>
                <dt className="text-lg font-medium text-gray-900">
                  Can I get a refund if I'm not satisfied?
                </dt>
                <dd className="mt-2 text-gray-600">
                  We offer a 7-day money-back guarantee for all paid plans. If you're not satisfied with our service, contact our support team within 7 days of your purchase for a full refund.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;