import Link from 'next/link'

export default function SignupPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Join DROPSHOP</h2>
      <p className="text-gray-500 text-sm mb-8">How will you use DROPSHOP?</p>
      <div className="space-y-4">
        <Link
          href="/signup/consumer"
          className="flex items-center gap-4 border-2 border-gray-200 hover:border-periwinkle rounded-2xl p-5 transition-colors group"
        >
          <div className="text-3xl">🛍️</div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-periwinkle">I&apos;m a Shopper</p>
            <p className="text-sm text-gray-500">Browse drops and win products at a fraction of retail</p>
          </div>
        </Link>
        <Link
          href="/signup/retailer"
          className="flex items-center gap-4 border-2 border-gray-200 hover:border-mint rounded-2xl p-5 transition-colors group"
        >
          <div className="text-3xl">🏪</div>
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-mint">I&apos;m a Retailer</p>
            <p className="text-sm text-gray-500">List products as drops and reach new customers</p>
          </div>
        </Link>
      </div>
      <p className="text-center text-sm text-gray-500 mt-8">
        Already have an account?{' '}
        <Link href="/login" className="text-periwinkle font-medium">
          Sign in
        </Link>
      </p>
    </>
  )
}
