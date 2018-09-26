// external modules
import React from 'react';
import { Helmet } from 'react-helmet';
import { graphql } from "gatsby"
import gql from 'graphql-tag';
import { Query } from 'react-apollo';


// local modules
import BasicLayout from '../components/layouts/layout-base/layout-base';
import MemberTeaser from './../components/components/member-teaser/member-teaser';

// Import page title from gatsby config. TODO Remove and fid title another way.
import GatsbyConfig from './../../gatsby-config';

class Members extends React.Component {
  constructor(props) {
    super(props);

    this.popUpList = this.props.data.allMembersJson.edges.map(()=>{
      return React.createRef();
    });

    this.state = {
      open: -1
    };
    this.ref = React.createRef();
  }

  // Puts an event listener for the UI handling (not that unsafe).
  UNSAFE_componentWillMount() {
    if (typeof document !== 'undefined')
      document.addEventListener('mousedown', this.handleOutsideClick, false);
  }

  // Remove the listener in absence of the component.
  ComponentWillUnmount() {
    if (typeof document !== 'undefined')
      document.removeEventListener('mousedown', this.handleOutsideClick, false);
  }


  handleClick = (id) => {
    const snapshot = {...this.state};
    const newId = (id === snapshot.open ? -1 : id)
    this.setState({open: newId});
  };

  handleOutsideClick = (event) => {
    const eventContainesClick = this.popUpList.some((popup)=>{
      return popup.current.contains(event.target);
    });

		if (this.state.open && !eventContainesClick) {
			this.setState({open: -1});
			return;
		}
	};

  render() {
    const snapshot = {...this.state};
    let members = this.props.data.allMembersJson.edges.slice();

    return (
      <BasicLayout>
        <Helmet>
          <title>{['Members', '|', GatsbyConfig.siteMetadata.title].join(" ")}</title>
        </Helmet>

        <div >
          <Query query={GET_MEMBERS}>
            {({ loading, error, data })=>{
              if (loading) return 'Loading....';
              if (error) return <div> `Error ${error.message}` </div> ;
              data.user = {
                ...data.user,
                username: data.user.userName
              };
              console.log(data.user);
              return (
                <div>
                  <MemberTeaser member={data.user} />
                </div>
              );
            }}
          </Query>
          {
            members.map((member, i)=>{
              return  ( <div ref={this.popUpList[i]} key={i} >
                <MemberTeaser member={member.node}  id={i}
                  open={snapshot.open === i} onClick={(id) => {this.handleClick(id)}}
                   />
              </div>)
            })
          }
        </div>

      </BasicLayout>
    );
  }
}

const GET_MEMBERS = gql`
  {
    user {
      id
      userName
      email
      firstName
      lastName
      imageUrl
      receiveNewsletter
      description
      sortDescription
      githubUrl
      personalUrl
    }
  }
`;

export default Members;

export const query = graphql`
  query IndexQuery {
    allMembersJson {
      edges {
        node {
          name
          isLeader
          image
          username
        }
      }
    }
  }
`;
