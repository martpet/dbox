import { PRICE_PER_GB_CENTS, SITE_NAME, SITE_TAGLINE } from "../util/consts.ts";

interface Props {
  noLogo?: boolean;
  noName?: boolean;
  noSubline?: boolean;
}

export default function AboutSite(props: Props) {
  const { noLogo, noName, noSubline } = props;
  const pricePerGb = PRICE_PER_GB_CENTS / 100;

  return (
    <section class="about-site prose">
      {!noLogo && <i class="ico-box-fill logo" />}

      {!noName && (
        <p class="site-name" role="presentation">
          {SITE_NAME}
        </p>
      )}

      {!noSubline && (
        <h1 class="title">
          {SITE_TAGLINE}
        </h1>
      )}

      <div class="card">
        <ul>
          <li>Shareable public links</li>
          <li>Unlimited downloads</li>
          <li>No expiration</li>
          <li>
            <strong>
              One-time ${pricePerGb}/GB uploaded
            </strong>
          </li>
        </ul>
      </div>

      <footer>
        <nav>
          <ul>
            <li>
              <a href="/terms">Terms</a>
            </li>
            <li>
              <a href="/privacy">Privacy</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </nav>
      </footer>
    </section>
  );
}
