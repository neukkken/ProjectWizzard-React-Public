import React from 'react';
import { Tooltip } from 'react-tooltip';
import { Github, Instagram, User } from 'lucide-react';

export default function OutTeamCard({ urlIg, urlGithub, nombre, rol }) {
    // Generar ids únicos para los tooltips basados en el nombre
    const igTooltipId = `igToolTip-${nombre}`;
    const gitTooltipId = `gitToolTip-${nombre}`;

    return (
        <div className="ourTeamMemberCard">
            <img
                src="https://sennovacaag.wordpress.com/wp-content/uploads/2020/09/sennova-logo.png"
                alt=""
                className="backgroundImg"
            />
            <User size={"100px"} />
            <h4>{nombre}</h4>
            <p>{rol}</p>
            <section className="socialMedia">
                <a
                    href={urlIg}
                    data-tooltip-id={igTooltipId}
                    data-tooltip-content="Instagram"
                    target="_blank"
                >
                    <Instagram color="green" />
                </a>
                <Tooltip id={igTooltipId} place="left" type="dark" effect="solid" />

                <a
                    href={urlGithub}
                    data-tooltip-id={gitTooltipId}
                    data-tooltip-content="Github"
                    target="_blank"
                >
                    <Github color="green" />
                </a>
                <Tooltip id={gitTooltipId} place="right" type="light" effect="solid" />
            </section>
        </div>
    );
}
