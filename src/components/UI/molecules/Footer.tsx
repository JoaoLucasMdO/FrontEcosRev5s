import { Box, Container, Grid, Typography, IconButton } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: 'primary.main', padding: '20px 0', color: 'white' }}>
      <Container>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="body2" gutterBottom color="white">© 2023 EcosRev</Typography>
          </Grid>
          <Grid item>
            <Box display="flex">
              {/* 
                Usando target="_blank" para abrir o link em uma nova aba.
                O rel="noopener noreferrer" é uma prática recomendada de segurança:
                - `noopener`: impede que a nova página tenha acesso ao objeto `window` da página que a abriu, 
                  evitando potenciais ataques de phishing e melhorando a performance.
                - `noreferrer`: impede que o referenciador (URL da página que contém o link) seja enviado para a nova página.
              */}
              <IconButton color="inherit" href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" href="https://github.com/Ecosrev/ecosrevMongo" target="_blank" rel="noopener noreferrer">
                <GitHubIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Footer;