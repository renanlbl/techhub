import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssuesList, SelectState, Paginator } from './styles';

export default class Repository extends Component {
  state = {
    repository: {},
    issues: [],
    loading: true,
    typeState: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  filter = async () => {
    await this.setState({
      repository: {},
      issues: [],
      loading: true,
    });

    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    const { page, typeState } = this.state;

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: typeState,
          per_page: 5,
          page,
        },
      }),
    ]);

    await this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  };

  handlePage = async type => {
    const { page } = this.state;
    if (type === 'back') {
      await this.setState({
        page: page - 1,
      });
    }

    if (type === 'next') {
      await this.setState({
        page: page + 1,
      });
    }

    this.filter();
  };

  handleTypeState = async e => {
    const { value } = e.target;
    await this.setState({
      typeState: value,
    });
    this.filter();
  };

  render() {
    const { repository, issues, loading, typeState, page } = this.state;

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar ao repositórios</Link>
          <SelectState value={typeState} onChange={this.handleTypeState}>
            <option value="open">open</option>
            <option value="closed">closed</option>
            <option value="all">all</option>
          </SelectState>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssuesList>
          {issues.map((issue, i) => (
            <li key={i || String(issues.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label, index) => (
                    <span key={String(label.id) || index}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>
        <Paginator page={page}>
          <button type="button" onClick={() => this.handlePage('back')}>
            A
          </button>
          <button type="button" onClick={() => this.handlePage('next')}>
            P
          </button>
        </Paginator>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
