import { Container, Row, Col } from 'react-bootstrap';
import backgroundImage from '../assets/Background.png';


// eslint-disable-next-line react/prop-types
const FormContainer = ({ children }) => {
   return (
      <div
      style={{
         backgroundImage: `url(${backgroundImage})`,
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         minHeight: '100vh',
         width: '100%',
         display: 'flex',
         overflow: 'hidden',
         alignItems: 'center',
         justifyContent: 'center',
         backgroundColor: 'black',
      }}
      >
         <div
            style={{
               minHeight: '100vh',
               width: '100%',
               alignItems: 'center',
               justifyContent: 'center',
               borderRadius:'0px 35px 35px 0px'
            }}
         >
            <Row className='justify-content-md'
               style={{
                  minHeight: '100vh',
                  width: '100%',
               }}
            >
               <Col xs={12} md={6} className='card'
               style={{
                  minHeight: '100vh',
                  width: '42%',
                  background: 'rgb(29,24,35)',
                  background: 'linear-gradient(84deg, rgba(29,24,35,1) 0%, rgba(31,25,37,1) 20%, rgba(52,38,61,1) 90%)'
               }}
               >
                  {children}
               </Col>
            </Row>
         </div>
      </div>
   );
};

export default FormContainer;