import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Font,
  Text,
} from 'react-email'

interface ConfirmEmailProps {
  url: string
  baseUrl?: string
}

const colors = {
  bg: '#ffffff',
  bg2: '#f6f7f8',
  fg: '#23201e',
  fg2: '#5c5858',
  fg3: '#9e9b9b',
  fgInverted: '#fafafb',
  blue: '#5b8bf7',
  pink: '#e21b70',
}

const ConfirmEmail = ({
  url,
  baseUrl = 'https://mojamanga.com',
}: ConfirmEmailProps) => {
  const logoUrl = `${baseUrl}/logo.png`
  // Залишаємо лише стилі, які неможливо інлайнити (псевдоелементи, ховери та медіазапити)
  const cssStyles = `
    .submit-button {
      position: relative;
    }

    .submit-button::before {
      content: '';
      position: absolute;
      inset: -1.5px;
      padding: 2px;
      background: linear-gradient(${colors.pink} 0%, ${colors.blue} 100%);
      border-radius: 9999px;
      opacity: 0;
      transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
      mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
      mask-clip: content-box, border-box;
      -webkit-mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
      -webkit-mask-clip: content-box, border-box;
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }

    .submit-button:focus-visible::before,
    .submit-button:hover::before {
      opacity: 1;
    }

    @media (max-width: 480px) {
      .email-container { 
        margin-top: 0 !important; 
      }
      .outer-section { 
        padding: 16px 8px !important; 
      }
      .card { 
        padding: 48px 24px !important; 
      }
    }
  `

  // Об'єкти інлайн-стилів для зручності читання коду
  const bodyStyle = {
    backgroundColor: colors.bg2,
    margin: 0,
    textAlign: 'center' as const,
    fontFamily: 'sans-serif',
  }

  const containerStyle = {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '32px',
    width: '100%',
    maxWidth: '640px',
  }

  const outerSectionStyle = {
    backgroundColor: colors.bg,
    padding: '16px 24px',
  }

  const cardStyle = {
    backgroundColor: colors.bg2,
    borderRadius: '8px',
    padding: '64px 40px',
    textAlign: 'center' as const,
  }

  const headerSectionStyle = {
    marginBottom: '12px',
  }

  const logoStyle = {
    margin: '0 auto 20px auto',
    display: 'block',
  }

  const titleStyle = {
    fontSize: '28px',
    color: colors.fg,
    margin: 0,
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
  }

  const descriptionStyle = {
    fontSize: '16px',
    color: colors.fg2,
    margin: '0 auto 32px auto',
    maxWidth: '380px',
    textAlign: 'center' as const,
    fontFamily: 'sans-serif',
    lineHeight: '24px',
  }

  const buttonSectionStyle = {
    marginBottom: '24px',
    textAlign: 'center' as const,
  }

  const submitButtonStyle = {
    cursor: 'pointer',
    backgroundColor: colors.fg,
    fontSize: '16px',
    color: colors.fgInverted,
    display: 'inline-block',
    borderRadius: '9999px',
    padding: '16px 28px',
    textAlign: 'center' as const,
    fontFamily: 'sans-serif',
    lineHeight: '24px',
    textDecoration: 'none',
  }

  const footerTextStyle = {
    fontSize: '13px',
    color: colors.fg3,
    margin: '32px auto 0 auto',
    maxWidth: '400px',
    textAlign: 'center' as const,
    fontFamily: 'sans-serif',
    lineHeight: '18px',
  }

  return (
    <Html>
      <Head>
        <Font
          fontFamily="FixelText"
          fallbackFontFamily="Verdana"
          webFont={{
            url: '/fonts/FixelVariable/FixelVariable.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <style>{cssStyles}</style>
      </Head>

      <Body style={bodyStyle}>
        <Preview>Підтвердьте електронну пошту</Preview>
        <Container className="email-container" style={containerStyle}>
          <Section>
            <Section className="outer-section" style={outerSectionStyle}>
              <Section className="card" style={cardStyle}>
                <Section style={headerSectionStyle}>
                  <Img src={logoUrl} alt="Logo" width={70} style={logoStyle} />
                  <Heading as="h1" style={titleStyle}>
                    Ще один крок!
                  </Heading>
                </Section>

                <Text style={descriptionStyle}>
                  Дякуємо, що зареєструвалися на сайті Моя Манга.
                  <br />
                  Щоб верифікувати ваш акаунт, нам необхідно підтвердити вашу
                  електронну пошту.
                </Text>

                <Section style={buttonSectionStyle}>
                  <Button
                    href={url}
                    className="submit-button"
                    style={submitButtonStyle}
                  >
                    Підтвердити пошту
                  </Button>
                </Section>

                <Text style={footerTextStyle}>
                  Якщо ви не реєстрували акаунт,
                  <br />
                  просто проігноруйте цей лист.
                </Text>
              </Section>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ConfirmEmail
